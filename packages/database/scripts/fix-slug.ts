import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const product = await prisma.product.findUnique({ where: { id: 'p_limon_pi??a' } });
  if (product) {
    await prisma.product.update({
      where: { id: 'p_limon_pi??a' },
      data: {
        id: 'p_limon_pina',
        slug: 'limonada-de-coco-con-pina',
        name: 'Limonada de Coco con Piña'
      }
    });
    console.log('Fixed product');
  } else {
    console.log('Product not found');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
