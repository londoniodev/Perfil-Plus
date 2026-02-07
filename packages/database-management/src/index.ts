import { PrismaClient } from '../generated/client';

// Singleton pattern for management database
const globalForPrisma = globalThis as unknown as {
    prismaManagement: PrismaClient | undefined;
};

export const prismaManagement =
    globalForPrisma.prismaManagement ??
    new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prismaManagement = prismaManagement;
}

// Re-export types
export * from '../generated/client';

// Export tenant pool utilities
export { getTenantPool, closeAllPools, closeTenantPool } from './tenant-pool';

