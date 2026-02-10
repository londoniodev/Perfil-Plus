import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding DeborahMoscoso Tenant...');

    const tenant = await prisma.tenant.upsert({
        where: { slug: 'deborahmoscoso-web' },
        update: {
            name: 'Deborah Moscoso',
            features: ['shop', 'blog', 'lms'],
            // domain field removed as it doesn't exist in schema
        },
        create: {
            slug: 'deborahmoscoso-web',
            name: 'Deborah Moscoso',
            dbName: 'db_deborahmoscoso', // Required field
            features: ['shop', 'blog', 'lms'],
            status: 'ACTIVE',
            plan: 'pro',
        }
    });

    console.log('✅ Tenant seeded:', tenant);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
