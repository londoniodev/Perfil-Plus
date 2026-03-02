import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://postgres:alvarojose1998@72.62.161.199:5432/web-projects"
        }
    }
});

const TENANT_SLUG = 'cocinasiete';

async function main() {
    console.log('Connecting to database...');

    const tenant = await prisma.tenant.findUnique({
        where: { slug: TENANT_SLUG }
    });

    if (!tenant) {
        throw new Error(`Tenant ${TENANT_SLUG} not found`);
    }

    const tenantId = tenant.id;
    const adminUser = await prisma.user.findFirst({
        where: { role: 'ADMIN', tenantId }
    });

    const adminId = adminUser?.id || null;

    console.log(`Working on tenant: ${TENANT_SLUG} (ID: ${tenantId})`);

    const inventoryItems = await prisma.inventoryItem.findMany({
        where: { tenantId }
    });

    const warehouse = await prisma.warehouse.findFirst({
        where: { tenantId, isDefault: true }
    });

    if (!warehouse) {
        throw new Error("Default warehouse not found");
    }

    // Arbitrary initial stock values
    const stockMap: Record<string, number> = {
        'Pan Brioche': 500, // UN
        'Carne Hamburguesa 150g': 450, // UN
        'Queso Cheddar Tajado': 800, // UN
        'Tocineta Ahumada': 5000, // GR
        'Pan de Perro Caliente': 300, // UN
        'Salchicha Americana': 300, // UN
        'Salchicha Suiza': 200, // UN
        'Porción Papas a la Francesa': 20000, // GR (20kg)
        'Nuggets de Pollo': 1000, // UN
        'Aros de Cebolla': 1500, // UN
        'Gaseosa 400ml (Botella)': 500, // UN
        'Pulpa de Fruta': 10000, // GR (10kg)
        'Limonada Base': 50000, // ML (50Lt)
        'Base Helado Vainilla': 15000, // GR (15kg)
        'Leche Entera': 20000, // ML (20Lt)
        'Brownie de Chocolate': 150, // UN
        'Queso Mozzarella Rallado': 5000, // GR (5kg)
        'Huevo de Codorniz': 2000, // UN
    };

    for (const item of inventoryItems) {
        const stockQty = stockMap[item.name];
        if (stockQty !== undefined && stockQty > 0) {

            // Check if stock already exists to not duplicate it blindly
            const existingStock = await prisma.warehouseStock.findUnique({
                where: {
                    warehouseId_inventoryItemId: {
                        warehouseId: warehouse.id,
                        inventoryItemId: item.id
                    }
                }
            });

            if (!existingStock || Number(existingStock.currentStock) === 0) {
                // Upsert stock
                await prisma.warehouseStock.upsert({
                    where: {
                        warehouseId_inventoryItemId: {
                            warehouseId: warehouse.id,
                            inventoryItemId: item.id
                        }
                    },
                    create: {
                        warehouseId: warehouse.id,
                        inventoryItemId: item.id,
                        currentStock: stockQty
                    },
                    update: {
                        currentStock: stockQty
                    }
                });

                // Register Movement
                await prisma.inventoryMovement.create({
                    data: {
                        tenantId,
                        inventoryItemId: item.id,
                        warehouseId: warehouse.id,
                        type: 'ENTRY',
                        quantity: stockQty,
                        unitCost: Number(item.avgCost),
                        reason: 'Inventario inicial automatizado',
                        createdBy: adminId
                    }
                });

                console.log(`Assigned initial stock for ${item.name}: ${stockQty} ${item.unit}`);
            } else {
                console.log(`Stock for ${item.name} already exists. Skipping.`);
            }
        } else {
            console.log(`Warning: No stock mapped for ${item.name}`);
        }
    }

    console.log('Finished updating stock successfully.');
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
