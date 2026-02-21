
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const tenantSlug = process.argv[2] || 'mauro'; // Default to 'mauro' if not provided
    console.log(`Seeding social data for tenant: ${tenantSlug}`);

    // Get Tenant DB URL
    const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
    });

    if (!tenant) {
        console.error(`Tenant ${tenantSlug} not found`);
        return;
    }

    // Connect to Tenant DB
    // specific logic for multi-tenancy URL construction if needed, 
    // but assuming we can use the same client if we knew the URL, 
    // OR we use the service logic. 
    // Since this is a script, we might not have access to the service 'getTenantClient' logic easily 
    // without importing the service or reproducing the logic.
    // The service logic usually replaces the schema in the URL.

    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) throw new Error("DATABASE_URL not set");

    const tenantUrl = databaseUrl.replace('public', `tenant_${tenant.id}`);

    const tenantClient = new PrismaClient({
        datasources: {
            db: {
                url: tenantUrl,
            },
        },
    });

    try {
        const products = await tenantClient.product.findMany();
        if (products.length === 0) {
            console.log("No products found.");
            return;
        }

        console.log(`Found ${products.length} products. Adding likes and comments...`);

        const comments = [
            "¡Delicioso!",
            "Me encanta este plato.",
            "100% recomendado.",
            "Volveré por más.",
            "La presentación es increíble.",
            "Muy buen sabor.",
            "Excelente servicio y comida.",
            "Mi favorito de la casa."
        ];

        const users = [
            { phone: "0991234567", name: "Juan P." },
            { phone: "0999876543", name: "Maria L." },
            { phone: "0981112222", name: "Carlos A." },
            { phone: "0973334444", name: "Ana S." },
            { phone: "0965556666", name: "Pedro M." }
        ];

        for (const product of products) {
            // Add 0-5 likes
            const numLikes = Math.floor(Math.random() * 6);
            for (let i = 0; i < numLikes; i++) {
                const user = users[i % users.length];
                // Check if exists
                const existing = await tenantClient.productLike.findUnique({
                    where: {
                        productId_userPhone: {
                            productId: product.id,
                            userPhone: user.phone
                        }
                    }
                });
                if (!existing) {
                    await tenantClient.productLike.create({
                        data: {
                            productId: product.id,
                            userPhone: user.phone
                        }
                    });
                }
            }

            // Add 0-3 comments
            const numComments = Math.floor(Math.random() * 4);
            for (let i = 0; i < numComments; i++) {
                const user = users[Math.floor(Math.random() * users.length)];
                const content = comments[Math.floor(Math.random() * comments.length)];

                await tenantClient.productComment.create({
                    data: {
                        productId: product.id,
                        userPhone: user.phone,
                        userName: user.name,
                        content: content,
                        isApproved: true
                    }
                });
            }
        }

        console.log("Seeding completed successfully!");

    } catch (e) {
        console.error("Error seeding:", e);
    } finally {
        await tenantClient.$disconnect();
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
