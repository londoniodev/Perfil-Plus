import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: 'postgresql://admin:password123@localhost:5432/mauromera_local?schema=public',
        },
    },
});

async function main() {
    console.log('🔧 Fixing missing restaurant categories...');

    // 1. Fetch all restaurant products
    const products = await prisma.product.findMany({
        where: {
            productType: 'RESTAURANT',
        },
    });

    console.log(`Found ${products.length} restaurant products.`);

    for (const product of products) {
        const specs = product.specs as any;
        if (specs && specs.category) {
            const categoryName = specs.category;
            const categorySlug = categoryName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

            console.log(`Checking category for ${product.name}: ${categoryName}`);

            // 2. Find or Create Category
            const category = await prisma.category.upsert({
                where: { slug: categorySlug },
                update: {},
                create: {
                    name: categoryName,
                    slug: categorySlug,
                }
            });

            // 3. Link Product to Category
            // Check if link exists
            const count = await prisma.$executeRawUnsafe(`
            SELECT count(*) FROM "CategoriesOnProducts" WHERE "productId" = '${product.id}' AND "categoryId" = '${category.id}'
        `);
            // The raw query returns an array of objects like [{ count: 0 }] or similar depending on driver

            // Safer approach using upsert if Prisma supported composite key upsert on join table directly via client...
            // But since we are using raw queries for the table creation earlier, let's use Prisma Client for the join table insertion if possible.
            // Prisma Client might not have generated the model for CategoriesOnProducts if it wasn't in schema.prisma properly at generation time.
            // But we added it manually.
            // Let's use raw SQL for insertion to be safe since the model might not be available in `prisma.categoriesOnProducts`.

            try {
                await prisma.$executeRawUnsafe(`
                INSERT INTO "CategoriesOnProducts" ("productId", "categoryId")
                VALUES ('${product.id}', '${category.id}')
                ON CONFLICT ("productId", "categoryId") DO NOTHING;
            `);
                console.log(`   Linked ${product.name} -> ${category.name}`);
            } catch (e) {
                console.error(`   Error linking ${product.name}:`, e.message);
            }

        } else {
            console.log(`   ⚠️ No category found in specs for ${product.name}`);
        }
    }

    console.log('🏁 Categories fix completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
