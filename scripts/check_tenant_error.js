var { PrismaClient } = require('@prisma/client');

// Hardcoded for debugging since dotenv loading might be tricky across packages
const dbUrl = "postgresql://admin:password123@localhost:5432/mauromera_local";

var prisma = new PrismaClient({
    datasources: {
        db: {
            url: dbUrl,
        },
    },
});

async function main() {
    console.log('Connecting to management database...');
    try {
        const tenants = await prisma.tenant.findMany();
        console.log(`Found ${tenants.length} tenants.`);

        const target = tenants.find(t => t.slug.includes('deborah') || t.name.toLowerCase().includes('deborah'));

        if (target) {
            console.log('--- Target Tenant ---');
            console.log('Name:', target.name);
            console.log('Slug:', target.slug);
            console.log('Status:', target.status);
            console.log('Notes (Error):', target.notes);
            console.log('---------------------');
        } else {
            console.log('Tenant "deborah" not found.');
            console.log('Available slugs:', tenants.map(t => t.slug).join(', '));
        }
    } catch (err) {
        console.error('Query failed:', err);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
