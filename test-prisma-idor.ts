import { PrismaClient } from '@alvarosky/database';

async function main() {
  const prisma = new PrismaClient();
  const args = { where: { id: "123", tenantId: "tenant-A" } };

  // Let's see if Prisma throws an error or ignores tenantId
  try {
    await prisma.product.findUnique(args as any);
    console.log("findUnique SUCCESS");
  } catch (e: any) {
    console.error("findUnique ERROR:", e.message);
  }
}

main().catch(console.error);
