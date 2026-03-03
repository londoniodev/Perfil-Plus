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
    console.log(`Working on tenant: ${TENANT_SLUG} (ID: ${tenantId})`);

    const inventoryItems = await prisma.inventoryItem.findMany({
        where: { tenantId }
    });

    // Assign arbitrary but realistic costs to the ingredients
    const costMap: Record<string, number> = {
        'Pan Brioche': 1200, // UN
        'Carne Hamburguesa 150g': 3500, // UN
        'Queso Cheddar Tajado': 600, // UN
        'Tocineta Ahumada': 25, // GR
        'Pan de Perro Caliente': 800, // UN
        'Salchicha Americana': 1500, // UN
        'Salchicha Suiza': 2000, // UN
        'Porción Papas a la Francesa': 10, // GR = 2500 per 250g
        'Nuggets de Pollo': 800, // UN
        'Aros de Cebolla': 500, // UN
        'Gaseosa 400ml (Botella)': 2000, // UN
        'Pulpa de Fruta': 15, // GR = 1500 per 100g
        'Limonada Base': 5, // ML = 1750 per 350ml
        'Base Helado Vainilla': 20, // GR = 3000 per 150g
        'Leche Entera': 4, // ML = 600 per 150ml
        'Brownie de Chocolate': 2500, // UN
        'Queso Mozzarella Rallado': 20, // GR = 800 per 40g
        'Huevo de Codorniz': 400, // UN
    };

    for (const item of inventoryItems) {
        const cost = costMap[item.name];
        if (cost !== undefined) {
            await prisma.inventoryItem.update({
                where: { id: item.id },
                data: {
                    avgCost: cost,
                    lastCost: cost
                }
            });
            console.log(`Updated cost for ${item.name}: $${cost} / ${item.unit}`);
        } else {
            console.log(`Warning: No cost mapped for ${item.name}`);
        }
    }

    console.log('Finished updating costs successfully.');
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
