import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: 'postgresql://admin:password123@localhost:5432/mauromera_local?schema=public',
        },
    },
});

async function main() {
    console.log('🔧 Fixing missing CategoriesOnProducts table...');

    try {
        await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "CategoriesOnProducts" (
            "productId" TEXT NOT NULL,
            "categoryId" TEXT NOT NULL,
            CONSTRAINT "CategoriesOnProducts_pkey" PRIMARY KEY ("productId","categoryId")
        );
      `);
        console.log('✅ Table CategoriesOnProducts created.');
    } catch (e) {
        console.log('⚠️  Table might already exist or error:', e.message);
    }

    try {
        await prisma.$executeRawUnsafe(`
        ALTER TABLE "CategoriesOnProducts" ADD CONSTRAINT "CategoriesOnProducts_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      `);
        console.log('✅ FK Product created.');
    } catch (e) {
        console.log('⚠️  FK Product error (maybe exists):', e.message);
    }

    try {
        await prisma.$executeRawUnsafe(`
        ALTER TABLE "CategoriesOnProducts" ADD CONSTRAINT "CategoriesOnProducts_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
      `);
        console.log('✅ FK Category created.');
    } catch (e) {
        console.log('⚠️  FK Category error (maybe exists):', e.message);
    }

    console.log('🏁 Schema fix completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
