import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- STARTING INVENTORY & RECIPE SEED ---');

    // Fetch an existing tenant or abort if there are no tenants
    const tenant = await prisma.tenant.findUnique({ where: { slug: 'cocinasiete' } });
    if (!tenant) {
        console.log('Tenant cocinasiete not found. Make sure it exists in the database.');
        return;
    }
    const tenantId = tenant.id;
    console.log(`Using Tenant: ${tenant.name || tenant.slug} (${tenantId})`);

    // Fetch an existing category or create a generic one
    let category = await prisma.category.findFirst({ where: { tenantId } });

    if (!category) {
        console.log('No Category found. Creating a default "General" category for seeding.');
        category = await prisma.category.create({
            data: {
                name: "General",
                slug: "general-seed",
                tenantId,
            }
        });
    }

    console.log('Cleaning up existing seed data for idempotent execution...');
    await prisma.inventoryMovement.deleteMany({ where: { tenantId } });
    await prisma.recipe.deleteMany({ where: { tenantId } });
    await prisma.productVariant.deleteMany({ where: { tenantId, sku: "BURG-CLAS-TOC-001" } });
    await prisma.product.deleteMany({ where: { tenantId, slug: "hamburguesa-clasica-tocineta-seed" } });
    await prisma.warehouseStock.deleteMany({ where: { warehouse: { tenantId } } });
    await prisma.inventoryItem.deleteMany({ where: { tenantId } });
    await prisma.warehouse.deleteMany({ where: { tenantId, name: "Bodega Principal" } });

    const warehouse = await prisma.warehouse.create({
        data: {
            name: "Bodega Principal",
            isDefault: true,
            tenantId,
        }
    });
    console.log(`Created Warehouse: ${warehouse.name}`);

    // 2. Create some Inventory Items (Ingredients)
    const bun = await prisma.inventoryItem.create({
        data: {
            name: "Pan Brioche",
            unit: "UN",
            minStock: 50,
            avgCost: 500,
            lastCost: 500,
            tenantId,
            stock: {
                create: {
                    warehouseId: warehouse.id,
                    currentStock: 200,
                }
            }
        }
    });

    const meat = await prisma.inventoryItem.create({
        data: {
            name: "Carne Hamburguesa 150g",
            unit: "UN",
            minStock: 30,
            avgCost: 2500,
            lastCost: 2500,
            tenantId,
            stock: {
                create: {
                    warehouseId: warehouse.id,
                    currentStock: 100, // Good
                }
            }
        }
    });

    const cheese = await prisma.inventoryItem.create({
        data: {
            name: "Queso Cheddar Tajado",
            unit: "UN",
            minStock: 50,
            avgCost: 300,
            lastCost: 300,
            tenantId,
            stock: {
                create: {
                    warehouseId: warehouse.id,
                    currentStock: 10, // LOW STOCK TRIGGER FOR DASHBOARD ALERTS!
                }
            }
        }
    });

    const bacon = await prisma.inventoryItem.create({
        data: {
            name: "Tocineta Ahumada",
            unit: "GR",
            minStock: 1000,
            avgCost: 15,
            lastCost: 15,
            tenantId,
            stock: {
                create: {
                    warehouseId: warehouse.id,
                    currentStock: 200, // LOW STOCK TRIGGER
                }
            }
        }
    });
    console.log('Created Ingredients: Pan, Carne, Queso, Tocineta');

    // 3. Create a Product to attach the Recipe
    const burgerProduct = await prisma.product.create({
        data: {
            name: "Hamburguesa Clásica con Tocineta",
            slug: "hamburguesa-clasica-tocineta-seed",
            description: "Clásica burger con queso y tocineta humada",
            basePrice: 18000,
            categories: {
                create: {
                    categoryId: category.id
                }
            },
            productType: "PHYSICAL",
            tenantId,
            variants: {
                create: {
                    name: "Única",
                    sku: "BURG-CLAS-TOC-001",
                    price: 18000,
                    tenantId,
                }
            }
        }
    });
    console.log(`Created Product: ${burgerProduct.name}`);

    // 4. Create the Recipe
    await prisma.recipe.create({
        data: {
            productId: burgerProduct.id,
            yield: 1, // 1 portion
            notes: "1. Tostar pan.\n2. Asar carne a la parrilla.\n3. Fundir queso sobre la carne.\n4. Cocinar tocineta hasta crujir.",
            tenantId,
            ingredients: {
                create: [
                    { inventoryItemId: bun.id, quantity: 1 },
                    { inventoryItemId: meat.id, quantity: 1 },
                    { inventoryItemId: cheese.id, quantity: 2 },
                    { inventoryItemId: bacon.id, quantity: 40, wasteFactor: 1.10 }, // 40g + 10% waste
                ]
            }
        }
    });
    console.log('Created Recipe for Hamburguesa Clásica');

    // 5. Create some Stock Movements (History)
    const userId = "seed-user";
    await prisma.inventoryMovement.createMany({
        data: [
            {
                inventoryItemId: bun.id,
                warehouseId: warehouse.id,
                type: "ENTRY",
                quantity: 200,
                unitCost: 500,
                reason: "Compra inicial",
                createdBy: userId,
                tenantId,
            },
            {
                inventoryItemId: meat.id,
                warehouseId: warehouse.id,
                type: "ENTRY",
                quantity: 100,
                unitCost: 2500,
                reason: "Compra inicial",
                createdBy: userId,
                tenantId,
            },
            {
                inventoryItemId: cheese.id,
                warehouseId: warehouse.id,
                type: "ENTRY",
                quantity: 10,
                unitCost: 300,
                reason: "Compra inicial",
                createdBy: userId,
                tenantId,
            },
            {
                inventoryItemId: bacon.id,
                warehouseId: warehouse.id,
                type: "ENTRY",
                quantity: 200,
                unitCost: 15,
                reason: "Compra inicial",
                createdBy: userId,
                tenantId,
            }
        ]
    });
    console.log('Created Initial Stock Movements');

    // 6. Simulate sales data to populate dashboard accurately
    const variantId = (await prisma.productVariant.findFirst({ where: { productId: burgerProduct.id } }))?.id;

    if (variantId) {
        // Create an order representing a sale
        const testOrder = await prisma.order.create({
            data: {
                tenantId,
                orderNumber: `ORD-SEED-${Date.now()}`,
                status: "DELIVERED",
                orderType: "DINE_IN",
                totalAmount: 36000,
                items: {
                    create: [
                        {
                            variantId,
                            productName: burgerProduct.name,
                            quantity: 2,
                            price: 18000,
                        }
                    ]
                },
                payments: {
                    create: [
                        {
                            amount: 36000,
                            method: "CARD",
                            reference: "SEED-PAYMENT",
                        }
                    ]
                }
            }
        });

        // Simulating the times
        await prisma.orderDeliveryAnalytics.create({
            data: {
                orderId: testOrder.id,
                timeToPrepare: 250, // seconds
                timeToShip: 700,    // seconds -> Approx 11.6 min of production time
                timeToDeliver: 150, // seconds
            }
        });

        // SALE Movements for accurate Cost charts
        await prisma.inventoryMovement.createMany({
            data: [
                {
                    inventoryItemId: bun.id,
                    warehouseId: warehouse.id,
                    type: "SALE",
                    quantity: -2,
                    reason: "Simulated Web Sale",
                    reference: testOrder.id,
                    tenantId,
                },
                {
                    inventoryItemId: meat.id,
                    warehouseId: warehouse.id,
                    type: "SALE",
                    quantity: -2,
                    reason: "Simulated Web Sale",
                    reference: testOrder.id,
                    tenantId,
                },
                {
                    inventoryItemId: cheese.id,
                    warehouseId: warehouse.id,
                    type: "SALE",
                    quantity: -4,
                    reason: "Simulated Web Sale",
                    reference: testOrder.id,
                    tenantId,
                },
                {
                    inventoryItemId: bacon.id,
                    warehouseId: warehouse.id,
                    type: "SALE",
                    quantity: -88, // 40 * 1.10 = 44 per burger * 2 = 88
                    reason: "Simulated Web Sale",
                    reference: testOrder.id,
                    tenantId,
                }
            ]
        });

        console.log('Simulated Sale order to trigger costing data on charts!');
    }

    console.log('--- SEED COMPLETED SUCCESSFULLY ---');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
