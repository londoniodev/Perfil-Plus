import { Injectable, Scope, Inject, OnModuleDestroy, Logger } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import type { Request } from 'express';

// Mapa de tenants: ID → nombre de base de datos
const TENANT_DATABASE_MAP: Record<string, string> = {
    'mauro': 'db_mauromera',
    'daniela': 'db_danielabotina',
    // Agregar más tenants según sea necesario
};

// Connection Cache global (fuera de la clase para persistir entre requests)
const prismaClientCache = new Map<string, PrismaClient>();

@Injectable({ scope: Scope.REQUEST })
export class PrismaService implements OnModuleDestroy {
    private readonly logger = new Logger(PrismaService.name);
    private _client: PrismaClient | null = null;
    private _tenantId: string | null = null;

    constructor(
        @Inject(REQUEST) private readonly request: Request,
        private readonly configService: ConfigService,
    ) {
        // No hacemos nada en el constructor - lazy loading
    }

    /**
     * Getter perezoso para el cliente Prisma.
     * Solo se resuelve el tenant y se crea la conexión cuando se accede.
     */
    get client(): PrismaClient {
        if (!this._client) {
            this._tenantId = this.resolveTenantId();
            this._client = this.getOrCreateClient(this._tenantId);
        }
        return this._client;
    }

    private resolveTenantId(): string {
        const tenantId = this.request.headers['x-tenant-id'] as string;

        if (!tenantId) {
            this.logger.error(`Missing x-tenant-id header for ${this.request.method} ${this.request.url}`);
            throw new Error('Missing x-tenant-id header');
        }

        if (!TENANT_DATABASE_MAP[tenantId]) {
            this.logger.error(`Unknown tenant: ${tenantId} for ${this.request.method} ${this.request.url}`);
            throw new Error(`Unknown tenant: ${tenantId}`);
        }

        return tenantId;
    }

    private getOrCreateClient(tenantId: string): PrismaClient {
        const existingClient = prismaClientCache.get(tenantId);

        if (existingClient) {
            this.logger.debug(`Reusing cached PrismaClient for tenant: ${tenantId}`);
            return existingClient;
        }

        const databaseName = TENANT_DATABASE_MAP[tenantId];
        const baseUrl = this.configService.get<string>('DATABASE_URL_BASE');

        if (!baseUrl) {
            throw new Error('DATABASE_URL_BASE environment variable is not set');
        }

        // Limpiar baseUrl de posibles slashes al final para evitar //
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

        // Conectar inmediatamente (no bloqueante)
        newClient.$connect().catch((err) => {
            this.logger.error(`Failed to connect to database for tenant ${tenantId}: ${err.message}`);
        });

        prismaClientCache.set(tenantId, newClient);
        this.logger.log(`Created new PrismaClient for tenant: ${tenantId} → ${databaseName}`);

        return newClient;
    }

    async onModuleDestroy() {
        // Cerrar todas las conexiones al destruir el módulo (shutdown de la app)
        for (const [tenantId, client] of prismaClientCache.entries()) {
            this.logger.log(`Disconnecting PrismaClient for tenant: ${tenantId}`);
            await client.$disconnect();
        }
        prismaClientCache.clear();
    }
}
