const { PrismaClient } = require('@alvarosky/database');
const prisma = new PrismaClient();
async function run() {
  const result = await prisma.$queryRaw`SELECT 1 as result`;
  console.log(result);
}
run().catch(console.error);
