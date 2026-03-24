import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.raw_Tenant.findUnique({
    where: { slug: 'soydeborasoysaludable' },
    include: { design: true }
  });

  if (!tenant || !tenant.design) {
    console.error('Tenant deborah no encontrado o sin diseño');
    process.exit(1);
  }

  const legacyLinks = [
    { label: "Inicio", href: "/" },
    { label: "Quién Soy", href: "/quien-soy" },
    { label: "Logros", href: "/logros" },
    { label: "Servicios", href: "/servicios" },
    { label: "Emprende", href: "/emprende" }
  ];

  await prisma.raw_TenantDesign.update({
    where: { id: tenant.design.id },
    data: {
      headerLinks: legacyLinks
    }
  });

  console.log('✅ Links actualizados en el diseño de deborahmoscoso');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
