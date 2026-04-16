import { PrismaClient } from '@alvarosky/database';
const prisma = new PrismaClient();

async function runBenchmark() {
  await prisma.$connect();
  const tenantId = 'benchmark-tenant-1';

  // Setup
  const category = await prisma.category.create({
    data: { name: 'Bench Category', slug: 'bench-cat', tenantId }
  });

  const product = await prisma.product.create({
    data: {
      tenantId,
      name: 'Bench Product',
      slug: 'bench-product',
      description: 'Test',
      productType: 'PHYSICAL',
      basePrice: 10,
    }
  });

  const variantsToCreate = Array.from({ length: 50 }).map((_, i) => ({
    tenantId,
    productId: product.id,
    sku: `sku-${i}`,
    name: `Var ${i}`,
    price: 10,
  }));

  await prisma.productVariant.createMany({ data: variantsToCreate });

  const variants = await prisma.productVariant.findMany({ where: { productId: product.id } });

  // Test Sequential
  const startSeq = performance.now();
  await prisma.$transaction(async (tx) => {
    for (const v of variants) {
      await tx.productVariant.update({
        where: { id: v.id },
        data: { stock: { increment: 1 } }
      });
    }
  });
  const endSeq = performance.now();

  // Test Parallel
  const startPar = performance.now();
  await prisma.$transaction(async (tx) => {
    const promises = variants
      .map((v, i) => ({ v, originalIndex: i }))
      .sort((a, b) => a.v.id.localeCompare(b.v.id))
      .map(({ v }) =>
        tx.productVariant.update({
          where: { id: v.id },
          data: { stock: { increment: 1 } }
        })
      );
    await Promise.all(promises);
  });
  const endPar = performance.now();

  console.log(`Sequential: ${(endSeq - startSeq).toFixed(2)} ms`);
  console.log(`Parallel: ${(endPar - startPar).toFixed(2)} ms`);
  console.log(`Improvement: ${(((endSeq - startSeq) - (endPar - startPar)) / (endSeq - startSeq) * 100).toFixed(2)}%`);

  // Cleanup
  await prisma.product.delete({ where: { id: product.id } });
  await prisma.category.delete({ where: { id: category.id } });
  await prisma.$disconnect();
}

runBenchmark().catch(console.error);
