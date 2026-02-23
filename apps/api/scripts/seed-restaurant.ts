
// @ts-nocheck
import { PrismaClient, ProductType } from '@prisma/client';

// Usar DATABASE_URL del entorno o fallback a local mauromera (ajustar según necesidad)
const databaseUrl = process.env.DATABASE_URL || 'postgresql://admin:password123@localhost:5432/db_mauromera?schema=public';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: databaseUrl,
        },
    },
});

async function main() {
    console.log('🌱 Seeding restaurant data into db_mauromera...');

    // 0. Validación de conexión y datos existentes (Simple)
    const existingProducts = await prisma.product.findMany({
        select: { name: true }
    });
    console.log('🔍 Existing products in target DB:', existingProducts.map(p => p.name));





    // 1. Crear Productos Restaurant
    const products = [
        {
            name: 'Hamburguesa Clásica',
            slug: 'hamburguesa-clasica',
            description: 'Carne de res 150g, lechuga, tomate y queso.',
            productType: ProductType.RESTAURANT,
            basePrice: 12.50,
            isAvailable: true,
            published: true,
            variants: [
                { name: 'Sencilla', price: 12.50, stock: 100 },
                { name: 'Doble Carne', price: 15.00, stock: 50 },
            ],
            modifierGroups: [
                {
                    name: 'Adiciones',
                    minSelect: 0,
                    maxSelect: 3,
                    modifiers: [
                        { name: 'Queso Extra', priceAdjustment: 1.50 },
                        { name: 'Tocino', priceAdjustment: 2.00 },
                        { name: 'Huevo', priceAdjustment: 1.00 },
                    ]
                }
            ]
        },
        {
            name: 'Pizza Margarita',
            slug: 'pizza-margarita',
            description: 'Salsa de tomate, mozzarella fresca y albahaca.',
            productType: ProductType.RESTAURANT,
            basePrice: 10.00,
            isAvailable: true,
            published: true,
            variants: [
                { name: 'Personal', price: 10.00, stock: 50 },
                { name: 'Familiar', price: 18.00, stock: 20 },
            ],
            modifierGroups: []
        },
        {
            name: 'Coca Cola',
            slug: 'coca-cola',
            description: 'Refresco carbonatado 355ml.',
            productType: ProductType.RESTAURANT,
            basePrice: 2.50,
            isAvailable: true,
            published: true,
            variants: [
                { name: 'Regular', price: 2.50, stock: 200 },
                { name: 'Zero', price: 2.50, stock: 150 },
            ],
            modifierGroups: []
        }
    ];

    for (const p of products) {
        const existing = await prisma.product.findUnique({ where: { slug: p.slug } });
        if (!existing) {
            const created = await prisma.product.create({
                data: {
                    name: p.name,
                    slug: p.slug,
                    description: p.description,
                    productType: p.productType,
                    basePrice: p.basePrice,
                    isAvailable: p.isAvailable,
                    published: p.published,
                    variants: {
                        create: p.variants.map((v) => ({
                            name: v.name,
                            price: v.price,
                            stock: v.stock,
                            sku: `${p.slug}-${v.name}`.toUpperCase().replace(/\s+/g, '-'),
                            attributes: {},
                        })),
                    },
                    modifierGroups: {
                        create: p.modifierGroups.map((g) => ({
                            name: g.name,
                            minSelect: g.minSelect,
                            maxSelect: g.maxSelect,
                            modifiers: {
                                create: g.modifiers.map((m) => ({
                                    name: m.name,
                                    priceAdjustment: m.priceAdjustment,
                                    stock: 100,
                                    isAvailable: true
                                }))
                            }
                        }))
                    }
                }
            });
            console.log(`✅ Created product: ${p.name}`);
        } else {
            console.log(`⚠️ Skipped product (exists): ${p.name}`);
        }
    }

    const tables = ['Mesa 1', 'Mesa 2', 'Mesa 3', 'Mesa 4', 'Mesa 5'];
    for (const tableName of tables) {
        const existing = await prisma.table.findFirst({
            where: { label: tableName }
        });

        if (!existing) {
            await prisma.table.create({
                data: {
                    label: tableName,
                    capacity: 4,
                    status: 'ACTIVE'
                }
            });
            console.log(`✅ Created table: ${tableName}`);
        } else {
            console.log(`⚠️ Skipped table (exists): ${tableName}`);
        }
    }

    console.log('🏁 Seed completed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
