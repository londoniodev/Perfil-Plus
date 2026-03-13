import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Borrando historial de WhatsApp para 573206341703...');
  
  const deleted = await prisma.waConversation.deleteMany({
    where: {
      customerPhone: '573206341703'
    }
  });

  console.log(`¡Listo! Se eliminaron ${deleted.count} conversaciones.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
