import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const tenants = await prisma.tenant.findMany({
        select: {
            id: true,
            slug: true,
            name: true,
            status: true
        }
    });

    console.log("=== TENANTS EN LA BASE DE DATOS ===");
    console.table(tenants);

    const users = await prisma.user.findMany({
        where: {
            OR: [
                { name: { contains: 'deborah', mode: 'insensitive' } },
                { name: { contains: 'mauro', mode: 'insensitive' } }
            ]
        },
        select: {
            id: true,
            name: true,
            email: true,
            tenantId: true
        }
    });

    console.log("\n=== USUARIOS RELACIONADOS ===");
    console.table(users);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
