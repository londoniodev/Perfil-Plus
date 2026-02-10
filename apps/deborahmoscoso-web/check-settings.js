const { PrismaClient } = require('@prisma/client');

// Initialize Prisma Client
// Note: It will use the DATABASE_URL from the environment
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Connecting to database...');
        const settings = await prisma.systemSetting.findMany();
        console.log('System Settings found:', settings.length);
        console.log(JSON.stringify(settings, null, 2));
    } catch (error) {
        console.error('Error fetching settings:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
