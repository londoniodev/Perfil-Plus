// Mock Prisma Tx
const tx = {
  productVariant: {
    findUnique: async ({ where }) => {
      // simulate network/db delay
      await new Promise(r => setTimeout(r, 2));
      return { id: where.id, price: 10, product: { productType: 'PHYSICAL', name: 'Test' } };
    },
    findMany: async ({ where }) => {
      // simulate network/db delay, findMany takes slightly longer but only called once
      await new Promise(r => setTimeout(r, 5));
      return where.id.in.map(id => ({ id, price: 10, product: { productType: 'PHYSICAL', name: 'Test' } }));
    }
  }
};

const items = Array.from({ length: 50 }, (_, i) => ({ variantId: `var-${i}`, quantity: 1 }));

async function testNPlusOne() {
  const start = performance.now();
  let total = 0;
  for (const item of items) {
    const variant = await tx.productVariant.findUnique({
      where: { id: item.variantId },
      include: { product: true },
    });
    if (variant) total += variant.price;
  }
  const end = performance.now();
  console.log(`N+1 approach took: ${(end - start).toFixed(2)} ms (Total: ${total})`);
}

async function testOptimized() {
  const start = performance.now();
  let total = 0;

  const variantIds = items.map(i => i.variantId);
  const variants = await tx.productVariant.findMany({
    where: { id: { in: variantIds } },
    include: { product: true },
  });
  const variantMap = new Map(variants.map(v => [v.id, v]));

  for (const item of items) {
    const variant = variantMap.get(item.variantId);
    if (variant) total += variant.price;
  }
  const end = performance.now();
  console.log(`Optimized approach took: ${(end - start).toFixed(2)} ms (Total: ${total})`);
}

async function run() {
  await testNPlusOne();
  await testOptimized();
}

run();
