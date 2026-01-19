import { Injectable, Scope, Inject, OnModuleDestroy, Logger } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import type { Request } from 'express';

// Connection Cache global para clientes de tenant (fuera de la clase para persistir entre requests)
const prismaClientCache = new Map<string, PrismaClient>();

// Cache de slug -> dbName para evitar consultas repetidas a la DB maestra
const tenantDbNameCache = new Map<string, string>();

// Pool de conexiones a la base de datos maestra (singleton)
let masterPool: Pool | null = null;

// Flag para saber si el pool ya fue inicializado
let poolInitialized = false;

@Injectable({ scope: Scope.REQUEST })
export class PrismaService implements OnModuleDestroy {
    private readonly logger = new Logger(PrismaService.name);
    private _client: PrismaClient | null = null;
    private _tenantId: string | null = null;
    private _initPromise: Promise<PrismaClient> | null = null;

    constructor(
        @Inject(REQUEST) private readonly request: Request,
        private readonly configService: ConfigService,
    ) {
        // Inicializar pool maestro si no existe
        this.initMasterPool();
    }

    private initMasterPool(): void {
        if (poolInitialized) return;

        const masterDbUrl = this.configService.get<string>('DATABASE_URL');
        if (masterDbUrl && !masterPool) {
            masterPool = new Pool({ connectionString: masterDbUrl, max: 5 });
            this.logger.log('Master database pool initialized');
        }
        poolInitialized = true;
    }

    /**
     * Getter para el cliente Prisma.
     * Inicia la inicialización si no se ha hecho y espera a que termine.
     * Para mantener compatibilidad con código existente que usa this.prisma.client
     */
    get client(): PrismaClient {
        if (this._client) {
            return this._client;
        }

        // Si el tenant está en cache, podemos resolver síncronamente
        const tenantId = this.resolveTenantId();
        const cachedDbName = tenantDbNameCache.get(tenantId);

        if (cachedDbName) {
            const existingClient = prismaClientCache.get(tenantId);
            if (existingClient) {
                this._client = existingClient;
                this._tenantId = tenantId;
                return this._client;
            }
        }

        // Si llegamos aquí, necesitamos inicializar de forma asíncrona
        // Lanzamos error con mensaje claro para que el desarrollador ajuste
        throw new Error(
            `Prisma client not ready for tenant "${tenantId}". ` +
            `This tenant is not in cache. The first request for a new tenant may need special handling.`
        );
    }

    /**
     * Inicializa el cliente Prisma de forma asíncrona.
     * Este método debe llamarse al inicio de cada request que necesite DB.
     */
    async initClient(): Promise<PrismaClient> {
        if (this._client) {
            return this._client;
        }

        // Evitar múltiples inicializaciones concurrentes
        if (this._initPromise) {
            return this._initPromise;
        }

        this._initPromise = this._initClientInternal();
        return this._initPromise;
    }

    private async _initClientInternal(): Promise<PrismaClient> {
        this._tenantId = this.resolveTenantId();
        this._client = await this.getOrCreateClient(this._tenantId);
        return this._client;
    }

    private resolveTenantId(): string {
        const tenantId = this.request.headers['x-tenant-id'] as string;
        const path = this.request.url;
        const method = this.request.method;

        // Lista de rutas públicas que NO requieren x-tenant-id
        // (para compatibilidad con SSR de Next.js)
        const publicRoutes = [
            '/api/ebooks',
            '/api/blog',
            '/api/lms/themes',
        ];

        const isPublicRoute = publicRoutes.some(route => path?.startsWith(route));

        if (!tenantId) {
            if (isPublicRoute && method === 'GET') {
                // Para rutas públicas de solo lectura, usar tenant por defecto
                const defaultTenant = this.configService.get('DEFAULT_TENANT_ID', 'mauro');
                this.logger.debug(`Public route ${path} without tenant-id, using default: ${defaultTenant}`);
                return defaultTenant;
            }

            this.logger.error(`Missing x-tenant-id header for ${method} ${path}`);
            throw new Error('Missing x-tenant-id header');
        }

        return tenantId;
    }

    /**
     * Consulta la tabla Tenant en la DB maestra para obtener el dbName.
     */
    private async lookupTenantDbName(slug: string): Promise<string> {
        // Primero verificar cache en memoria
        const cachedDbName = tenantDbNameCache.get(slug);
        if (cachedDbName) {
            this.logger.debug(`Tenant ${slug} found in cache → ${cachedDbName}`);
            return cachedDbName;
        }

        // Consultar base de datos maestra
        if (!masterPool) {
            throw new Error('Master database pool not initialized. Check DATABASE_URL env variable.');
        }

        try {
            const result = await masterPool.query(
                'SELECT "dbName" FROM "Tenant" WHERE slug = $1',
                [slug]
            );

            if (result.rows.length === 0) {
                throw new Error(`Tenant not found: ${slug}`);
            }

            const dbName = result.rows[0].dbName;

            // Guardar en cache
            tenantDbNameCache.set(slug, dbName);
            this.logger.log(`Tenant ${slug} resolved to database: ${dbName}`);

            return dbName;
        } catch (error) {
            if (error instanceof Error && error.message.startsWith('Tenant not found')) {
                throw error;
            }
            this.logger.error(`Error looking up tenant ${slug}: ${error}`);
            throw new Error(`Failed to lookup tenant: ${slug}`);
        }
    }

    private async getOrCreateClient(tenantId: string): Promise<PrismaClient> {
        // Verificar si ya existe un cliente en cache
        const existingClient = prismaClientCache.get(tenantId);
        if (existingClient) {
            this.logger.debug(`Reusing cached PrismaClient for tenant: ${tenantId}`);
            return existingClient;
        }

        // Obtener nombre de base de datos desde la tabla Tenant
        const databaseName = await this.lookupTenantDbName(tenantId);

        const baseUrl = this.configService.get<string>('DATABASE_URL_BASE');
        if (!baseUrl) {
            throw new Error('DATABASE_URL_BASE environment variable is not set');
        }

        // Limpiar baseUrl de posibles slashes al final
        const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
        const connectionUrl = `${cleanBaseUrl}/${databaseName}`;

        this.logger.debug(`Connecting to database: ${cleanBaseUrl.split('@')[1] || 'hidden-host'}/${databaseName}`);

        const newClient = new PrismaClient({
            datasources: {
                db: { url: connectionUrl }
            },
            log: this.configService.get('NODE_ENV') === 'development'
                ? ['query', 'error', 'warn']
                : ['error'],
        });

        // Conectar inmediatamente
        try {
            await newClient.$connect();
            this.logger.log(`Connected to database for tenant: ${tenantId} → ${databaseName}`);
        } catch (err) {
            this.logger.error(`Failed to connect to database for tenant ${tenantId}: ${err}`);
            throw err;
        }

        prismaClientCache.set(tenantId, newClient);
        return newClient;
    }

    /**
     * Método para refrescar el cache de un tenant específico (útil para admin).
     */
    static invalidateTenantCache(slug: string): void {
        tenantDbNameCache.delete(slug);
    }

    /**
     * Método para limpiar todo el cache de tenants.
     */
    static clearAllCaches(): void {
        tenantDbNameCache.clear();
    }

    async onModuleDestroy() {
        // Cerrar todas las conexiones de clientes de tenant
        for (const [tenantId, client] of prismaClientCache.entries()) {
            this.logger.log(`Disconnecting PrismaClient for tenant: ${tenantId}`);
            await client.$disconnect();
        }
        prismaClientCache.clear();

        // Cerrar pool maestro
        if (masterPool) {
            this.logger.log('Closing master database pool');
            await masterPool.end();
            masterPool = null;
            poolInitialized = false;
        }
    }
}

