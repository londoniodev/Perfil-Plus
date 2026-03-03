const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://postgres:alvarojose1998@72.62.161.199:5432/web-projects"
        },
    },
});

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function main() {
    console.log("Iniciando Seed de Órdenes Reales para Dashboard (PRODUCCIÓN)...");

    const sampleProduct = await prisma.product.findFirst();
    if (!sampleProduct) {
        throw new Error("No hay productos en toda la BD.");
    }
    const tenantId = sampleProduct.tenantId;

    const products = await prisma.product.findMany({
        where: { tenantId },
        include: { variants: true }
    });

    if (products.length === 0) {
        throw new Error("No hay productos. Agrega productos al menú primero.");
    }

    const orderTypes = ['DINE_IN', 'TAKE_AWAY', 'DELIVERY'];
    const paymentMethods = ['CASH', 'CARD', 'TRANSFER', 'OTHER'];

    // Crear 150 ordenes en los ultimos 6 meses
    const now = new Date();
    const sixMonthsAgo = new Date(now);
    sixMonthsAgo.setMonth(now.getMonth() - 6);

    for (let i = 0; i < 150; i++) {
        const orderDate = randomDate(sixMonthsAgo, now);

        // Random 1 to 4 items
        const numItems = randomInt(1, 4);
        const orderItems = [];
        let totalAmount = 0;

        for (let j = 0; j < numItems; j++) {
            const product = products[randomInt(0, products.length - 1)];
            const variant = product.variants.length > 0 ? product.variants[0] : null;

            if (!variant) continue;

            const quantity = randomInt(1, 3);
            const price = Number(variant.price);
            totalAmount += price * quantity;

            orderItems.push({
                variantId: variant.id,
                quantity,
                price,
                productName: product.name,
                variantName: variant.name || 'Defecto',
                isPaid: true,
                isPrepared: true,
                createdAt: orderDate
            });
        }

        if (orderItems.length === 0) continue;

        const type = orderTypes[randomInt(0, orderTypes.length - 1)];
        const oStatus = 'DELIVERED'; // Force completed

        // Delivery analytics
        const prepTime = randomInt(60, 400); // 1-6 minutes
        const shipTime = randomInt(60, 200);
        const deliverTime = randomInt(300, 1800); // 5-30 mins if delivery

        const createdOrder = await prisma.order.create({
            data: {
                tenantId,
                orderNumber: `DEMO-${i}-${Date.now().toString().slice(-4)}`,
                totalAmount,
                status: oStatus,
                orderType: type,
                createdAt: orderDate,
                updatedAt: orderDate,
                guestCount: type === 'DINE_IN' ? randomInt(1, 6) : null,
                items: {
                    create: orderItems
                },
                payments: {
                    create: [
                        {
                            amount: totalAmount,
                            method: paymentMethods[randomInt(0, paymentMethods.length - 1)],
                            createdAt: orderDate
                        }
                    ]
                },
                deliveryAnalytics: {
                    create: {
                        pendingAt: orderDate,
                        preparingAt: new Date(orderDate.getTime() + prepTime * 1000),
                        shippedAt: new Date(orderDate.getTime() + (prepTime + shipTime) * 1000),
                        deliveredAt: new Date(orderDate.getTime() + (prepTime + shipTime + deliverTime) * 1000),
                        timeToPrepare: prepTime,
                        timeToShip: shipTime,
                        timeToDeliver: deliverTime
                    }
                }
            }
        });
    }

    console.log("✅ Seed completado con 150 órdenes históricas en la base de datos de producción para las gráficas.");
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
