const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://postgres:alvarojose1998@72.62.161.199:5432/web-projects"
        },
    },
});

async function main() {
    console.log("Conectando a BD de Producción...");

    const purchasesCount = await prisma.purchase.count();
    console.log(`Total Purchases in DB: ${purchasesCount}`);

    const usersCount = await prisma.user.count();
    console.log(`Total Users in DB: ${usersCount}`);

    const productsCount = await prisma.product.count();
    console.log(`Total Products in DB: ${productsCount}`);
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
