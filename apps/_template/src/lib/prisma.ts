import { PrismaClient } from "@alvarosky/database-management";

const globalForPrisma = globalThis as unknown as {
    prismaManagement: PrismaClient | undefined;
};

export const prisma =
    globalForPrisma.prismaManagement ??
    new PrismaClient({
        datasources: {
            db: {
                url: process.env.MANAGEMENT_DATABASE_URL,
            },
        },
    });

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prismaManagement = prisma;
}
