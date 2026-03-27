import { PrismaClient } from '@alvarosky/database';

const prisma = new PrismaClient();

async function run() {
  const tenantId = `bench-${Date.now()}`;
  console.log(`Setting up data for tenant ${tenantId}...`);
  try {
    const tenant = await prisma.tenant.create({
      data: {
        id: tenantId,
        name: 'Bench Tenant',
        slug: tenantId,
      }
    });

    const category = await prisma.category.create({
      data: {
        name: 'Bench Category',
        tenantId,
      }
    });

    const product = await prisma.product.create({
      data: {
        name: 'Bench Product',
        tenantId,
        categoryId: category.id,
        price: 10,
        variants: {
          create: {
            name: 'Default',
            price: 10,
            stock: 100,
            tenantId,
          }
        }
      },
      include: { variants: true }
    });

    const modifierGroup = await prisma.modifierGroup.create({
      data: {
        name: 'Bench Modifiers',
        tenantId,
        modifiers: {
          create: Array.from({ length: 5 }).map((_, i) => ({
            name: `Mod ${i}`,
            price: 1,
            stock: 50,
            tenantId,
          }))
        }
      },
      include: { modifiers: true }
    });

    const order = await prisma.order.create({
      data: {
        tenantId,
        orderNumber: 'BENCH-1',
        totalAmount: 100,
        status: 'PENDING',
        items: {
          create: Array.from({ length: 20 }).map((_, i) => ({
            variantId: product.variants[0].id,
            quantity: 1,
            price: 10,
            productName: 'Bench Test',
            variantName: 'Default',
            modifiers: {
              create: modifierGroup.modifiers.map(mod => ({
                modifierId: mod.id,
                modifierName: mod.name,
                priceAdjustment: mod.price,
                quantity: 1,
              }))
            }
          }))
        }
      }
    });

    console.log(`Order created with ID: ${order.id}`);

    // N+1 issue isolated:
    const orderWithItems = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        items: { include: { modifiers: true, variant: true } },
      },
    });

    if (orderWithItems) {
      const start = performance.now();

      await prisma.$transaction(async (tx) => {
          for (const item of orderWithItems.items) {
            if (item.variant.stock !== -1) {
              await tx.productVariant.update({
                where: { id: item.variantId },
                data: { stock: { increment: item.quantity } },
              });
            }

            for (const mod of item.modifiers) {
              const originalModifier = await tx.modifier.findUnique({
                where: { id: mod.modifierId },
              });
              if (originalModifier && originalModifier.stock !== null) {
                await tx.modifier.update({
                  where: { id: mod.modifierId },
                  data: { stock: { increment: mod.quantity * item.quantity } },
                });
              }
            }
          }
      });

      const end = performance.now();
      console.log(`\n========================================`);
      console.log(`N+1 execution took: ${(end - start).toFixed(2)} ms`);
      console.log(`========================================\n`);
    }

  } catch (err) {
    console.error("Error during benchmark:", err);
  } finally {
    console.log('Cleaning up data...');
    await prisma.order.deleteMany({ where: { tenantId } });
    await prisma.product.deleteMany({ where: { tenantId } });
    await prisma.category.deleteMany({ where: { tenantId } });
    await prisma.modifierGroup.deleteMany({ where: { tenantId } });
    await prisma.tenant.deleteMany({ where: { id: tenantId } });
    await prisma.$disconnect();
  }
}

run().catch(console.error);
