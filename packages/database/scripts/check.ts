import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    where: {
      slug: {
        contains: 'a'
      }
    },
    select: { name: true, slug: true }
  });
  console.log(products.filter(p => p.slug.includes('?') || p.name.includes('?')));
}

main().catch(console.error).finally(() => prisma.$disconnect());
