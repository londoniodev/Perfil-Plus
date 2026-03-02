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

    // 1. Fetch available products
    const products = await prisma.product.findMany({
        where: { tenantId, deletedAt: null }
    });

    console.log(`Found ${products.length} products`);

    // 2. Define standard ingredients we need
    const requiredIngredients = [
        { name: 'Pan Brioche', unit: 'UN' },
        { name: 'Carne Hamburguesa 150g', unit: 'UN' },
        { name: 'Queso Cheddar Tajado', unit: 'UN' },
        { name: 'Tocineta Ahumada', unit: 'GR' },
        { name: 'Pan de Perro Caliente', unit: 'UN' },
        { name: 'Salchicha Americana', unit: 'UN' },
        { name: 'Salchicha Suiza', unit: 'UN' },
        { name: 'Porción Papas a la Francesa', unit: 'GR' },
        { name: 'Nuggets de Pollo', unit: 'UN' },
        { name: 'Aros de Cebolla', unit: 'UN' },
        { name: 'Gaseosa 400ml (Botella)', unit: 'UN' },
        { name: 'Pulpa de Fruta', unit: 'GR' },
        { name: 'Limonada Base', unit: 'ML' },
        { name: 'Base Helado Vainilla', unit: 'GR' },
        { name: 'Leche Entera', unit: 'ML' },
        { name: 'Brownie de Chocolate', unit: 'UN' },
        { name: 'Queso Mozzarella Rallado', unit: 'GR' },
        { name: 'Huevo de Codorniz', unit: 'UN' }
    ];

    // 3. Upsert Ingredients
    console.log('Upserting inventory items...');
    const inventoryMap = new Map();
    for (const item of requiredIngredients) {
        let dbItem = await prisma.inventoryItem.findFirst({
            where: { tenantId, name: item.name }
        });

        if (!dbItem) {
            dbItem = await prisma.inventoryItem.create({
                data: {
                    tenantId,
                    name: item.name,
                    unit: item.unit as any,
                    avgCost: 0,
                    lastCost: 0,
                    minStock: 10,
                    isActive: true
                }
            });
            console.log(`Created inventory item: ${item.name}`);
        } else {
            console.log(`Found inventory item: ${item.name}`);
        }
        inventoryMap.set(item.name, dbItem.id);
    }

    // Helper to find Product ID by name substring
    const getProduct = (substring: string) => products.find(p => p.name.toLowerCase().includes(substring.toLowerCase()));

    // 4. Define Recipe Mapping
    const recipesMapping = [
        {
            productName: 'Hamburguesa Clásica',
            ingredients: [
                { name: 'Pan Brioche', qty: 1 },
                { name: 'Carne Hamburguesa 150g', qty: 1 },
                { name: 'Queso Cheddar Tajado', qty: 1 }
            ]
        },
        {
            productName: 'Hamburguesa Clásica con Tocineta',
            ingredients: [
                { name: 'Pan Brioche', qty: 1 },
                { name: 'Carne Hamburguesa 150g', qty: 1 },
                { name: 'Queso Cheddar Tajado', qty: 1 },
                { name: 'Tocineta Ahumada', qty: 30 } // 30 gramos
            ]
        },
        {
            productName: 'Hamburguesa Doble Carne',
            ingredients: [
                { name: 'Pan Brioche', qty: 1 },
                { name: 'Carne Hamburguesa 150g', qty: 2 },
                { name: 'Queso Cheddar Tajado', qty: 2 },
                { name: 'Tocineta Ahumada', qty: 30 }
            ]
        },
        {
            productName: 'Hamburguesa BBQ Bacon',
            ingredients: [
                { name: 'Pan Brioche', qty: 1 },
                { name: 'Carne Hamburguesa 150g', qty: 1 },
                { name: 'Queso Cheddar Tajado', qty: 1 },
                { name: 'Tocineta Ahumada', qty: 45 },
                { name: 'Aros de Cebolla', qty: 2 }
            ]
        },
        {
            productName: 'Perro Caliente Sencillo',
            ingredients: [
                { name: 'Pan de Perro Caliente', qty: 1 },
                { name: 'Salchicha Americana', qty: 1 },
                { name: 'Queso Mozzarella Rallado', qty: 30 }
            ]
        },
        {
            productName: 'Perro Caliente Suizo',
            ingredients: [
                { name: 'Pan de Perro Caliente', qty: 1 },
                { name: 'Salchicha Suiza', qty: 1 },
                { name: 'Queso Mozzarella Rallado', qty: 50 },
                { name: 'Tocineta Ahumada', qty: 20 },
                { name: 'Huevo de Codorniz', qty: 3 }
            ]
        },
        {
            productName: 'Salchipapa Tradicional',
            ingredients: [
                { name: 'Porción Papas a la Francesa', qty: 250 },
                { name: 'Salchicha Americana', qty: 1 },
                { name: 'Queso Mozzarella Rallado', qty: 40 }
            ]
        },
        {
            productName: 'Salchipapa Especial Increíble',
            ingredients: [
                { name: 'Porción Papas a la Francesa', qty: 350 },
                { name: 'Salchicha Suiza', qty: 1 },
                { name: 'Carne Hamburguesa 150g', qty: 1 }, // Carne picada
                { name: 'Queso Mozzarella Rallado', qty: 80 },
                { name: 'Tocineta Ahumada', qty: 40 },
                { name: 'Huevo de Codorniz', qty: 5 }
            ]
        },
        {
            productName: 'Porción de Papas Fritas',
            ingredients: [
                { name: 'Porción Papas a la Francesa', qty: 200 }
            ]
        },
        {
            productName: 'Nuggets de Pollo',
            ingredients: [
                { name: 'Nuggets de Pollo', qty: 6 } // Supongamos porción de 6
            ]
        },
        {
            productName: 'Anillos de Cebolla',
            ingredients: [
                { name: 'Aros de Cebolla', qty: 8 } // Porción de 8 aros
            ]
        },
        {
            productName: 'Gaseosa 400ml',
            ingredients: [
                { name: 'Gaseosa 400ml (Botella)', qty: 1 }
            ]
        },
        {
            productName: 'Jugo Natural en Agua',
            ingredients: [
                { name: 'Pulpa de Fruta', qty: 100 }
            ]
        },
        {
            productName: 'Limonada Cerezada',
            ingredients: [
                { name: 'Limonada Base', qty: 350 },
                { name: 'Pulpa de Fruta', qty: 50 } // Cereza
            ]
        },
        {
            productName: 'Malteada Espesa',
            ingredients: [
                { name: 'Base Helado Vainilla', qty: 150 },
                { name: 'Leche Entera', qty: 150 }
            ]
        },
        {
            productName: 'Brownie Meltdown con Helado',
            ingredients: [
                { name: 'Brownie de Chocolate', qty: 1 },
                { name: 'Base Helado Vainilla', qty: 80 }
            ]
        }
    ];

    // 5. Create Recipes and RecipeIngredients
    console.log('Creating BOMs...');

    for (const recipeDef of recipesMapping) {
        const product = getProduct(recipeDef.productName);
        if (!product) {
            console.warn(`Product not found for recipe mapping: ${recipeDef.productName}`);
            continue;
        }

        // Upsert Recipe
        let recipe = await prisma.recipe.findUnique({
            where: { productId: product.id }
        });

        if (!recipe) {
            recipe = await prisma.recipe.create({
                data: {
                    tenantId,
                    productId: product.id,
                    yield: 1,
                    notes: 'Auto-generated BOM'
                }
            });
            console.log(`Created Recipe for product: ${product.name}`);
        } else {
            console.log(`Recipe exists for product: ${product.name}`);
        }

        // Upsert Ingredients linked to this Recipe
        for (const ing of recipeDef.ingredients) {
            const inventoryItemId = inventoryMap.get(ing.name);

            if (!inventoryItemId) {
                console.warn(`Inventory item not found for required ingredient: ${ing.name}`);
                continue;
            }

            await prisma.recipeIngredient.upsert({
                where: {
                    recipeId_inventoryItemId: {
                        recipeId: recipe.id,
                        inventoryItemId: inventoryItemId
                    }
                },
                update: {
                    quantity: ing.qty
                },
                create: {
                    recipeId: recipe.id,
                    inventoryItemId: inventoryItemId,
                    quantity: ing.qty,
                    wasteFactor: 1
                }
            });
            console.log(`   Added ${ing.name} to BOM of ${product.name}`);
        }

    }

    console.log('Finished successfully.');
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
