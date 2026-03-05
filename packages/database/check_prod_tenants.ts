import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://postgres:alvarojose1998@72.62.161.199:5432/web-projects"
        }
    }
});

async function main() {
    console.log("=== TODOS LOS USUARIOS PROD ===");
    const users = await prisma.user.findMany({
        select: { id: true, name: true, email: true, tenantId: true, role: true }
    });
    console.log(JSON.stringify(users, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
