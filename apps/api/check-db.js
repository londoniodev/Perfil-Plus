const { PrismaClient } = require('@prisma/client');

async function main() {
    const prisma = new PrismaClient();
    try {
        const tenants = await prisma.tenant.findMany({
            select: { slug: true, status: true, id: true }
        });
        console.log("ALL TENANTS IN DB:");
        console.table(tenants);

        const mauro = await prisma.tenant.findFirst({
            where: { slug: 'mauromera' }
        });
        console.log("MAURO MERA LOOKUP:");
        console.log(mauro);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
