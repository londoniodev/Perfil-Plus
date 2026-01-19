import { PrismaClient } from '@prisma/client'

// Patrón Singleton para evitar múltiples conexiones en Next.js hot-reload
const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Re-exportar tipos y enums de Prisma
// Re-exportar tipos y enums de Prisma
export { Prisma, PrismaClient } from '@prisma/client'
export * from '@prisma/client'
