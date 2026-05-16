const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.findFirst({
    select: { id: true, slug: true }
  });
  console.log(JSON.stringify(tenant));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
