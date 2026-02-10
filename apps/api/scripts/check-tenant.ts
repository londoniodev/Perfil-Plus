import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Buscando tenants...');
    const tenants = await prisma.tenant.findMany();
    console.log('Found tenants:', JSON.stringify(tenants, null, 2));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
