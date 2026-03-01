import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- STARTING INVENTORY & RECIPE SEED ---');

    // Fetch an existing tenant or abort if there are no tenants
    const tenant = await prisma.tenant.findFirst();
    if (!tenant) {
        console.log('No tenants found. Make sure you have created at least one tenant.');
        return;
    }
    const tenantId = tenant.id;
    console.log(`Using Tenant: ${tenant.name} (${tenantId})`);

    // Fetch an existing active store and category
    const store = await prisma.store.findFirst({ where: { tenantId } });
    const category = await prisma.category.findFirst({ where: { tenantId } });

    if (!store || !category) {
        console.log('Skipping because no Store or Category exists. Create a store and a product category first.');
        return;
    }

    // 1. Create a Default Warehouse
    const warehouse = await prisma.warehouse.create({
        data: {
            name: "Bodega Principal",
            location: "Sede Centro",
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
            description: "Clásica burger con queso y tocineta humada",
            basePrice: 18000,
            categoryId: category.id,
            productType: "PHYSICAL",
            tenantId,
            storeId: store.id,
            variants: {
                create: {
                    name: "Única",
                    sku: "BURG-CLAS-TOC-001",
                    price: 18000,
                    inStock: true,
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
            instructions: "1. Tostar pan.\n2. Asar carne a la parrilla.\n3. Fundir queso sobre la carne.\n4. Cocinar tocineta hasta crujir.",
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
                previousStock: 0,
                newStock: 200,
                reason: "Compra inicial",
                userId,
                tenantId,
            },
            {
                inventoryItemId: meat.id,
                warehouseId: warehouse.id,
                type: "ENTRY",
                quantity: 100,
                unitCost: 2500,
                previousStock: 0,
                newStock: 100,
                reason: "Compra inicial",
                userId,
                tenantId,
            },
        ]
    });
    console.log('Created Initial Stock Movements');

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
