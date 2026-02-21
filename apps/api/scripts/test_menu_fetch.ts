import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: 'postgresql://admin:password123@localhost:5432/mauromera_local?schema=public',
        },
    },
});

async function main() {
    console.log('🧪 Testing product fetch with categories...');

    // Fetch 'Limonada Natural' specifically
    const products = await prisma.product.findMany({
        where: {
            productType: 'RESTAURANT',
            slug: 'limonada-natural'
        },
        include: {
            categories: {
                include: {
                    category: true,
                },
            },
        },
    });

    console.log(JSON.stringify(products, null, 2));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
