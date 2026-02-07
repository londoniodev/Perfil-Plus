import { Pool, PoolConfig } from "pg";

/**
 * Cache de pools de conexión para tenants
 * Evita crear múltiples pools para la misma base de datos
 */
const poolCache = new Map<string, Pool>();

/**
 * Obtiene o crea un Pool de conexiones para la base de datos de un tenant
 * @param dbName - Nombre de la base de datos del tenant (ej: "db_mauro")
 * @param config - Configuración adicional opcional del pool
 */
export function getTenantPool(dbName: string, config?: Partial<PoolConfig>): Pool {
    const cacheKey = dbName;

    if (!poolCache.has(cacheKey)) {
        const masterUrl = process.env.DATABASE_URL;
        if (!masterUrl) {
            throw new Error("DATABASE_URL environment variable is not set");
        }

        const url = new URL(masterUrl);
        url.pathname = `/${dbName}`;

        const pool = new Pool({
            connectionString: url.toString(),
            max: config?.max ?? 5,
            idleTimeoutMillis: config?.idleTimeoutMillis ?? 30000,
            connectionTimeoutMillis: config?.connectionTimeoutMillis ?? 10000,
            ...config,
        });

        // Log de conexión en desarrollo
        if (process.env.NODE_ENV === "development") {
            console.log(`[getTenantPool] Created pool for: ${dbName}`);
        }

        poolCache.set(cacheKey, pool);
    }

    return poolCache.get(cacheKey)!;
}

/**
 * Cierra todos los pools de conexión en cache
 * Útil para cleanup en tests o shutdown graceful
 */
export async function closeAllPools(): Promise<void> {
    const promises = Array.from(poolCache.values()).map((pool) => pool.end());
    await Promise.all(promises);
    poolCache.clear();
}

/**
 * Cierra el pool de un tenant específico
 */
export async function closeTenantPool(dbName: string): Promise<void> {
    const pool = poolCache.get(dbName);
    if (pool) {
        await pool.end();
        poolCache.delete(dbName);
    }
}
