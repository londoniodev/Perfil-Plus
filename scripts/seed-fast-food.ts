import { PrismaClient, ProductType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Iniciando seeder de comida rápida...");

    // Find the primary tenant (cocinasiete)
    let tenant = await prisma.tenant.findFirst({
        where: { slug: { contains: "cocinasiete", mode: "insensitive" } }
    });

    if (!tenant) {
        tenant = await prisma.tenant.findFirst(); // fallback to first available
        if (!tenant) {
            console.error("No se encontró ningún Tenant en la BD.");
            return;
        }
    }

    const tenantId = tenant.id;
    console.log(`Usando Tenant: ${tenant.name || tenant.slug} (${tenantId})`);

    // Helper para generar slug único
    const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 1000);

    const categoriesList = ["Hamburguesas", "Perros Calientes", "Acompañantes", "Bebidas", "Postres"];
    const categoryMap: Record<string, string> = {};

    for (const cat of categoriesList) {
        const existing = await prisma.category.findFirst({
            where: { tenantId, name: cat }
        });
        if (existing) {
            categoryMap[cat] = existing.id;
        } else {
            const created = await prisma.category.create({
                data: {
                    tenantId,
                    name: cat,
                    slug: generateSlug(cat)
                }
            });
            categoryMap[cat] = created.id;
        }
    }

    const productsData = [
        // HAMBURGUESAS
        {
            name: "Hamburguesa Clásica",
            cat: "Hamburguesas",
            desc: "Pan artesanal, 150g de carne de res, queso cheddar, tomate, lechuga y salsas de la casa.",
            basePrice: 18000,
            variants: [
                { name: "Sencilla", price: 18000, isDefault: true },
                { name: "En Combo (Papas + Gaseosa)", price: 28000, isDefault: false }
            ],
            modifierGroups: [
                { name: "Adiciones", min: 0, max: 5, mods: [{ name: "Extra Queso", price: 3000 }, { name: "Extra Tocineta", price: 4000 }, { name: "Extra Carne 150g", price: 8000 }] },
                { name: "Salsas (Elige hasta 3)", min: 0, max: 3, mods: [{ name: "Salsa de Ajo", price: 0 }, { name: "BBQ", price: 0 }, { name: "Mayonesa", price: 0 }, { name: "Salsa de Piña", price: 0 }] },
                { name: "Quitar ingredientes", min: 0, max: 3, mods: [{ name: "Sin Cebolla", price: 0 }, { name: "Sin Tomate", price: 0 }, { name: "Sin Lechuga", price: 0 }] }
            ]
        },
        {
            name: "Hamburguesa Doble Carne",
            cat: "Hamburguesas",
            desc: "Doble porción de carne de 150g, doble queso cheddar, tocineta crujiente, vegetales frescos y cebolla caramelizada.",
            basePrice: 25000,
            variants: [
                { name: "Sencilla", price: 25000, isDefault: true },
                { name: "En Combo (Papas + Gaseosa)", price: 35000, isDefault: false }
            ],
            modifierGroups: [
                { name: "Adiciones", min: 0, max: 5, mods: [{ name: "Extra Queso", price: 3000 }, { name: "Extra Tocineta", price: 4000 }, { name: "Extra Carne 150g", price: 8000 }] },
                { name: "Salsas", min: 0, max: 3, mods: [{ name: "Salsa de Ajo", price: 0 }, { name: "BBQ", price: 0 }, { name: "Mayonesa", price: 0 }, { name: "Salsa de Piña", price: 0 }] },
                { name: "Quitar ingredientes", min: 0, max: 3, mods: [{ name: "Sin Cebolla", price: 0 }, { name: "Sin Tomate", price: 0 }, { name: "Sin Lechuga", price: 0 }] }
            ]
        },
        {
            name: "Hamburguesa BBQ Bacon",
            cat: "Hamburguesas",
            desc: "Carne de res 150g, abundante tocineta, aros de cebolla empanizados y nuestra salsa BBQ especial.",
            basePrice: 22000,
            variants: [
                { name: "Sencilla", price: 22000, isDefault: true },
                { name: "En Combo (Papas + Gaseosa)", price: 32000, isDefault: false }
            ],
            modifierGroups: [
                { name: "Adiciones", min: 0, max: 5, mods: [{ name: "Extra Queso", price: 3000 }, { name: "Doble Tocineta", price: 4000 }, { name: "Extra BBQ", price: 1000 }] },
                { name: "Quitar ingredientes", min: 0, max: 3, mods: [{ name: "Sin aros de cebolla", price: 0 }, { name: "Sin Tomate", price: 0 }] }
            ]
        },
        // PERROS CALIENTES
        {
            name: "Perro Caliente Sencillo",
            cat: "Perros Calientes",
            desc: "Pan suave, salchicha americana, queso fundido, papita ripio, salsa piña y salsas tradicionales.",
            basePrice: 12000,
            variants: [
                { name: "Sencillo", price: 12000, isDefault: true },
                { name: "En Combo (Papas + Gaseosa)", price: 22000, isDefault: false }
            ],
            modifierGroups: [
                { name: "Adiciones", min: 0, max: 4, mods: [{ name: "Extra Queso", price: 2500 }, { name: "Tocineta Picada", price: 3000 }, { name: "Huevos de Codorniz x3", price: 2500 }] },
                { name: "Salsas", min: 0, max: 3, mods: [{ name: "Salsa Rosada", price: 0 }, { name: "Salsa de Piña", price: 0 }, { name: "Salsa de Ajo", price: 0 }] },
                { name: "Quitar ingredientes", min: 0, max: 2, mods: [{ name: "Sin Papita Ripio", price: 0 }, { name: "Sin Salsas", price: 0 }] }
            ]
        },
        {
            name: "Perro Caliente Suizo",
            cat: "Perros Calientes",
            desc: "Salchicha suiza premium, costra de queso mozzarella, tocineta, papita ripio y salsas.",
            basePrice: 16000,
            variants: [
                { name: "Sencillo", price: 16000, isDefault: true },
                { name: "En Combo (Papas + Gaseosa)", price: 26000, isDefault: false }
            ],
            modifierGroups: [
                { name: "Adiciones", min: 0, max: 4, mods: [{ name: "Extra Queso", price: 2500 }, { name: "Pollo Desmechado", price: 4000 }, { name: "Huevos de Codorniz x3", price: 2500 }] },
                { name: "Quitar ingredientes", min: 0, max: 2, mods: [{ name: "Sin Papita Ripio", price: 0 }] }
            ]
        },
        // ACOMPAÑANTES
        {
            name: "Salchipapa Tradicional",
            cat: "Acompañantes",
            desc: "Porción de papas a la francesa, salchicha premium picada, queso fundido y salsas.",
            basePrice: 15000,
            variants: [
                { name: "Personal", price: 15000, isDefault: true },
                { name: "Para Compartir (2 Personas)", price: 28000, isDefault: false }
            ],
            modifierGroups: [
                { name: "Adiciones", min: 0, max: 3, mods: [{ name: "Extra Queso Costeño", price: 3000 }, { name: "Pollo Desmechado", price: 5000 }, { name: "Chorizo Picado", price: 4500 }] },
                { name: "Salsas", min: 0, max: 3, mods: [{ name: "Salsa de Ajo", price: 0 }, { name: "BBQ", price: 0 }, { name: "Ketchup", price: 0 }] }
            ]
        },
        {
            name: "Salchipapa Especial Increíble",
            cat: "Acompañantes",
            desc: "Papas francesas, salchicha, pollo desmechado, carne desmechada, tocineta, maíz tierno y extra queso gratinado.",
            basePrice: 22000,
            variants: [
                { name: "Personal", price: 22000, isDefault: true },
                { name: "Para Compartir (Super)", price: 40000, isDefault: false }
            ],
            modifierGroups: [
                { name: "Adiciones", min: 0, max: 3, mods: [{ name: "Huevos de codorniz x5", price: 4000 }, { name: "Chorizo", price: 4500 }] },
                { name: "Salsas", min: 0, max: 3, mods: [{ name: "Salsa de Ajo", price: 0 }, { name: "BBQ", price: 0 }] }
            ]
        },
        {
            name: "Porción de Papas Fritas",
            cat: "Acompañantes",
            desc: "Crocantes papas a la francesa.",
            basePrice: 8000,
            variants: [
                { name: "Sencillas", price: 8000, isDefault: true },
                { name: "Con Cheddar y Tocineta", price: 13000, isDefault: false }
            ],
            modifierGroups: []
        },
        {
            name: "Anillos de Cebolla",
            cat: "Acompañantes",
            desc: "Anillos de cebolla empanizados y crujientes, acompañados de tu salsa favorita.",
            basePrice: 10000,
            variants: [
                { name: "Porción de 8 unidades", price: 10000, isDefault: true }
            ],
            modifierGroups: [
                { name: "Salsa a elegir", min: 1, max: 1, mods: [{ name: "Salsa Ranch", price: 0 }, { name: "Salsa BBQ", price: 0 }, { name: "Salsa de Ajo", price: 0 }] }
            ]
        },
        {
            name: "Nuggets de Pollo",
            cat: "Acompañantes",
            desc: "Deliciosos nuggets de pechuga de pollo, dorados por fuera y jugosos por dentro.",
            basePrice: 12000,
            variants: [
                { name: "Porción 6 unidades", price: 12000, isDefault: true },
                { name: "Porción 12 unidades", price: 20000, isDefault: false }
            ],
            modifierGroups: [
                { name: "Salsa a elegir", min: 1, max: 1, mods: [{ name: "Miel Mostaza", price: 0 }, { name: "BBQ", price: 0 }, { name: "Agridulce", price: 0 }] }
            ]
        },
        // BEBIDAS
        {
            name: "Gaseosa 400ml",
            cat: "Bebidas",
            desc: "Gaseosa refrescante de 400ml.",
            basePrice: 4500,
            variants: [
                { name: "Coca Cola", price: 4500, isDefault: true },
                { name: "Coca Cola Zero", price: 4500, isDefault: false },
                { name: "Postobón Manzana", price: 4500, isDefault: false },
                { name: "Sprite", price: 4500, isDefault: false }
            ],
            modifierGroups: []
        },
        {
            name: "Jugo Natural en Agua",
            cat: "Bebidas",
            desc: "Jugo natural recién hecho, en agua.",
            basePrice: 6000,
            variants: [
                { name: "Mora", price: 6000, isDefault: true },
                { name: "Mango", price: 6000, isDefault: false },
                { name: "Lulo", price: 6000, isDefault: false },
                { name: "Maracuyá", price: 6000, isDefault: false }
            ],
            modifierGroups: [
                { name: "Endulzante", min: 0, max: 1, mods: [{ name: "Sin Azúcar", price: 0 }, { name: "Splenda", price: 0 }] }
            ]
        },
        {
            name: "Limonada Cerezada",
            cat: "Bebidas",
            desc: "Deliciosa limonada frapeada con sirop de cereza.",
            basePrice: 8000,
            variants: [
                { name: "Vaso de 16onz", price: 8000, isDefault: true }
            ],
            modifierGroups: []
        },
        // POSTRES
        {
            name: "Brownie Meltdown con Helado",
            cat: "Postres",
            desc: "Brownie caliente fundido, acompañado de una bola de helado y salsa de chocolate.",
            basePrice: 12000,
            variants: [
                { name: "Porción Individual", price: 12000, isDefault: true }
            ],
            modifierGroups: [
                { name: "Sabor de Helado", min: 1, max: 1, mods: [{ name: "Vainilla", price: 0 }, { name: "Chocolate", price: 0 }, { name: "Arequipe", price: 0 }] },
                { name: "Extra", min: 0, max: 1, mods: [{ name: "Extra Bola de Helado", price: 3000 }] }
            ]
        },
        {
            name: "Malteada Espesa",
            cat: "Postres",
            desc: "Malteada súper espesa a base de helado premium y crema chantilly.",
            basePrice: 14000,
            variants: [
                { name: "Vainilla Clásica", price: 14000, isDefault: true },
                { name: "Chocolate Intenso", price: 14000, isDefault: false },
                { name: "Fresa Cremosa", price: 14000, isDefault: false },
                { name: "Oreo Crunch", price: 16000, isDefault: false }
            ],
            modifierGroups: [
                { name: "Adición Suplemento", min: 0, max: 3, mods: [{ name: "Galleta Oreo Extra", price: 2000 }, { name: "Barquillo", price: 1500 }, { name: "Chips de Chocolate", price: 1500 }] }
            ]
        }
    ];

    for (let i = 0; i < productsData.length; i++) {
        const prodData = productsData[i];

        // Check if product already exists to avoid duplicates on re-runs
        const existingProduct = await prisma.product.findFirst({
            where: { tenantId, name: prodData.name }
        });

        if (existingProduct) {
            console.log(`[${i + 1}/${productsData.length}] Producto ya existe (Saltando): ${prodData.name}`);
            continue;
        }

        // Prepare base product
        const product = await prisma.product.create({
            data: {
                tenantId,
                name: prodData.name,
                slug: generateSlug(prodData.name),
                description: prodData.desc,
                productType: ProductType.RESTAURANT,
                basePrice: prodData.basePrice,
                published: true,
                isAvailable: true,
                images: [],
                categories: {
                    create: {
                        categoryId: categoryMap[prodData.cat],
                    }
                }
            }
        });

        // Add Variants
        for (let j = 0; j < prodData.variants.length; j++) {
            const variantData = prodData.variants[j];
            // Fix SKU truncation bug for long slugs by using a distinct random ID
            const uniqueSku = `SKU-${Math.floor(Math.random() * 1000000)}-${j + 1}`;

            await prisma.productVariant.create({
                data: {
                    tenantId,
                    productId: product.id,
                    sku: uniqueSku,
                    name: variantData.name,
                    price: variantData.price,
                    stock: 9999, // infinite stock for fast food
                    isDefault: variantData.isDefault
                }
            });
        }

        // Add Modifiers
        if (prodData.modifierGroups && prodData.modifierGroups.length > 0) {
            for (const mg of prodData.modifierGroups) {
                const group = await prisma.modifierGroup.create({
                    data: {
                        tenantId,
                        productId: product.id,
                        name: mg.name,
                        minSelect: mg.min,
                        maxSelect: mg.max
                    }
                });

                for (const mod of mg.mods) {
                    await prisma.modifier.create({
                        data: {
                            tenantId,
                            groupId: group.id,
                            name: mod.name,
                            priceAdjustment: mod.price,
                            isAvailable: true
                        }
                    });
                }
            }
        }

        console.log(`[${i + 1}/${productsData.length}] Producto creado: ${prodData.name}`);
    }

    console.log("¡Seeding de comida rápida completado exitosamente!");
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
