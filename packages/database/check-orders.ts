const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    console.log("Status Counts:");
    const byStatus = await prisma.order.groupBy({ by: ['status'], _count: { id: true } });
    console.log(byStatus);

    console.log("Total orders:", await prisma.order.count());
}
main().finally(() => prisma.$disconnect());
