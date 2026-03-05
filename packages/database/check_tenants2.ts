import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("=== USUARIOS EN PLATAFORMA ===");
    const users = await prisma.user.findMany({
        select: { id: true, name: true, email: true, tenantId: true, role: true }
    });
    console.log(JSON.stringify(users, null, 2));

    console.log("=== PLATFORMS USERS ===");
    if (prisma.platformUser) {
        const platformUsers = await prisma.platformUser.findMany();
        console.log(JSON.stringify(platformUsers, null, 2));
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
