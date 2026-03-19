import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.create({
    data: {
      slug: "alvarolondono",
      domain: "xn--alvarolondoo-khb.dev",
      dbName: "web-projects",
      name: "Alvaro Londoño",
      status: "ACTIVE",
      plan: "free",
      features: ["RESTAURANT", "POS"],
      ownerEmail: "alvarolondono@alvarolondono.dev",
      design: {
        colors: { primary: "#000000", secondary: "#ffffff" },
        radius: 0.5,
      } as any,
    },
  });

  console.log('✅ Tenant creado exitosamente:', tenant);
}

main()
  .catch((e) => {
    console.error('❌ Error creando tenant:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
