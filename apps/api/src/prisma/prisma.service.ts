import { Injectable, Scope, Inject, OnModuleDestroy, Logger } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
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
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) {
        // Inicializar pool maestro si no existe
        this.initMasterPool();
    }

    private initMasterPool() {
        if (poolInitialized) return;

        const databaseUrl = this.configService.get<string>('DATABASE_URL');
        if (!databaseUrl) {
            throw new Error('DATABASE_URL environment variable is not set');
        }

        masterPool = new Pool({
            connectionString: databaseUrl,
            max: 5, // Mantener pocas conexiones para el maestro
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        });

        masterPool.on('error', (err) => {
            this.logger.error('Unexpected error on idle master client', err);
            process.exit(-1);
        });

        poolInitialized = true;
        this.logger.log('Master database pool initialized');
    }

    /**
     * Consulta la tabla Tenant en la DB maestra para obtener el dbName.
     * Usa Redis para caching (1 hora).
     */
    private async lookupTenantDbName(slug: string): Promise<string> {
        const cacheKey = `tenant_db:${slug}`;

        // 1. Buscar en Redis
        try {
            const cachedDbName = await this.cacheManager.get<string>(cacheKey);
            if (cachedDbName) {
                this.logger.debug(`Tenant ${slug} found in Redis Cache → ${cachedDbName}`);
                return cachedDbName;
            }
        } catch (err) {
            this.logger.warn(`Redis cache get failed for ${slug}: ${err}`);
        }

        // 2. Verificar cache en memoria (backup L1)
        const memoryCached = tenantDbNameCache.get(slug);
        if (memoryCached) return memoryCached;

        // 3. Consultar base de datos maestra
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

            // 4. Guardar en Redis (TTL 1 hora = 3600000 ms)
            try {
                await this.cacheManager.set(cacheKey, dbName, 3600000);
            } catch (err) {
                this.logger.warn(`Redis cache set failed for ${slug}: ${err}`);
            }

            // Guardar en memoria
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
     * Inicializa el cliente Prisma para el request actual basado en el tenant ID.
     * Debe ser llamado por un interceptor o guard antes de usar el servicio.
     */
    async initClient() {
        const tenantId = this.request.headers['x-tenant-id'] as string;
        if (!tenantId) {
            // Si no hay tenant, no inicializamos (quedará en null)
            // Los servicios que requieran DB fallarán si intentan acceder a client
            return;
        }
        this._client = await this.getOrCreateClient(tenantId);
    }

    /**
     * Obtiene la instancia de PrismaClient inicializada para el tenant actual.
     * Lanza error si no se ha inicializado.
     */
    get client(): PrismaClient {
        if (!this._client) {
            throw new Error('PrismaClient not initialized. Missing x-tenant-id header or initClient() not called.');
        }
        return this._client;
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

