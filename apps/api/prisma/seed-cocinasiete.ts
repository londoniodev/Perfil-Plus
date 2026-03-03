import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://postgres:alvarojose1998@72.62.161.199:5432/web-projects"
        }
    }
});

async function main() {
    console.log("Iniciando seed para Cocina Siete en Producción...");

    // 1. Obtener el Tenant
    const tenantSlug = "cocinasiete";
    let tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug }
    });

    if (!tenant) {
        console.log(`❌ No se encontró el tenant '${tenantSlug}'. Abortando.`);
        return;
    }
    const tenantId = tenant.id;
    console.log(`✅ Tenant encontrado: ${tenant.name} (ID: ${tenantId})`);

    // 2. Clear existing demo data (Optional, but let's just insert new ones or upsert to be safe)
    // To keep it simple and safe for production, let's create only if they don't exist by slug

    // 3. Crear Categorías
    const categoriesData = [
        { name: "Entradas", slug: "entradas" },
        { name: "Platos Fuertes", slug: "platos-fuertes" },
        { name: "Bebidas", slug: "bebidas" },
        { name: "Postres", slug: "postres" },
    ];

    const createdCategories: any[] = [];
    for (const cat of categoriesData) {
        const category = await prisma.category.upsert({
            where: {
                tenantId_slug: { tenantId, slug: cat.slug }
            },
            update: {},
            create: {
                tenantId,
                name: cat.name,
                slug: cat.slug
            }
        });
        createdCategories.push(category);
        console.log(`✅ Categoría lista: ${category.name}`);
    }

    const [entradas, fuertes, bebidas, postres] = createdCategories;

    // 4. Crear Mesas
    const tablesData = ["Mesa 1", "Mesa 2", "Mesa 3", "Mesa 4", "Mesa 5", "Barra 1", "Barra 2"];
    for (let i = 0; i < tablesData.length; i++) {
        const bgX = (i % 3) * 150;
        const bgY = Math.floor(i / 3) * 150;

        // Check if exists first to avoid duplicate names if we don't have unique constraint on label
        const existingTable = await prisma.table.findFirst({
            where: { tenantId, label: tablesData[i] }
        });

        if (!existingTable) {
            await prisma.table.create({
                data: {
                    tenantId,
                    label: tablesData[i],
                    capacity: tablesData[i].startsWith("Barra") ? 1 : 4,
                    x: bgX,
                    y: bgY
                }
            });
            console.log(`✅ Mesa creada: ${tablesData[i]}`);
        } else {
            console.log(`✅ Mesa existente: ${tablesData[i]}`);
        }
    }

    // 5. Crear Productos y Variantes
    const productsData = [
        {
            name: "Empanadas de Pipían",
            slug: "empanadas-pipian",
            description: "Deliciosas empanadas tradicionales rellenas de pipián (papa colorada y maní), servidas con ají de maní.",
            productType: "RESTAURANT" as any,
            basePrice: 6500,
            images: ["https://d1on8qs0xdu5jz.cloudfront.net/webapp/images/fotos/b/0000000000/2157_1.jpg"],
            categoryId: entradas.id
        },
        {
            name: "Cazuela de Mariscos",
            slug: "cazuela-mariscos",
            description: "Cazuela cremosa de mariscos frescos, acompañada de arroz con coco y patacones.",
            productType: "RESTAURANT" as any,
            basePrice: 35000,
            images: ["https://cdn.colombia.com/gastronomia/2012/03/30/cazuela-de-mariscos-1786.jpg"],
            categoryId: fuertes.id
        },
        {
            name: "Bandeja Paisa",
            slug: "bandeja-paisa",
            description: "Plato tradicional colombiano con frijoles, arroz, chicharrón, carne molida, chorizo, huevo frito, plátano maduro y arepa.",
            productType: "RESTAURANT" as any,
            basePrice: 28500,
            images: ["https://cdn.colombia.com/sdi/2011/05/25/bandeja-paisa-1160454.jpg"],
            categoryId: fuertes.id
        },
        {
            name: "Limonada de Coco",
            slug: "limonada-coco",
            description: "Refrescante limonada natural cremosa con leche de coco.",
            productType: "RESTAURANT" as any,
            basePrice: 8000,
            images: ["https://recetasdecolombia.com/wp-content/uploads/2020/09/limonada-de-coco.jpg"],
            categoryId: bebidas.id
        },
        {
            name: "Postre de Natas",
            slug: "postre-natas",
            description: "Postre tradicional de leche y yemas de huevo, con pasas.",
            productType: "RESTAURANT" as any,
            basePrice: 9000,
            images: ["https://cdn.colombia.com/sdi/2011/05/26/postre-de-natas-1160472.jpg"],
            categoryId: postres.id
        }
    ];

    for (const p of productsData) {
        const product = await prisma.product.upsert({
            where: {
                tenantId_slug: { tenantId, slug: p.slug }
            },
            update: {},
            create: {
                tenantId,
                name: p.name,
                slug: p.slug,
                description: p.description,
                productType: p.productType,
                basePrice: p.basePrice,
                images: p.images,
                published: true,
                categories: {
                    create: [
                        { categoryId: p.categoryId }
                    ]
                },
                variants: {
                    create: [
                        {
                            tenantId,
                            sku: `${p.slug}-default`,
                            name: "Única",
                            price: p.basePrice,
                            stock: 100,
                            isDefault: true
                        }
                    ]
                }
            }
        });
        console.log(`✅ Producto listo: ${product.name}`);
    }

    console.log("🎉 Seed finalizado exitosamente.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
