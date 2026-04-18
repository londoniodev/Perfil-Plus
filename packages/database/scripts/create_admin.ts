import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:alvarojose1998@72.62.161.199:5432/web-projects',
    },
  },
});

async function main() {
  const password = 'Demo123!';
  const email = 'facebooktest';
  
  console.log("Buscando el tenant...");
  
  // Buscar el tenant por el slug exacto o su versión punycode
  const tenant = await prisma.tenant.findFirst({
    where: {
      OR: [
        { slug: 'alvarolondoño' },
        { slug: 'xn--alvarolondoo-bhb' }
      ]
    }
  });

  if (!tenant) {
    console.error("❌ No se encontró el tenant para 'alvarolondoño' o 'xn--alvarolondoo-bhb'.");
    const allTenants = await prisma.tenant.findMany({ select: { id: true, slug: true, name: true } });
    console.log("Tenants disponibles:", allTenants);
    return;
  }

  console.log(`✅ Tenant encontrado: ${tenant.slug} (ID: ${tenant.id})`);

  // Hashear la contraseña con bcryptjs
  const hashedPassword = await bcrypt.hash(password, 10);

  // Usar upsert por si el usuario ya existe, actualizar su rol y contraseña
  const user = await prisma.user.upsert({
    where: {
      tenantId_email: {
        tenantId: tenant.id,
        email: email
      }
    },
    update: {
      password: hashedPassword,
      role: 'ADMIN',
      name: 'Facebook Test Admin'
    },
    create: {
      email: email,
      password: hashedPassword,
      name: 'Facebook Test Admin',
      role: 'ADMIN',
      tenantId: tenant.id,
      emailVerified: true
    }
  });

  console.log(`✅ Usuario ADMIN '${user.email}' creado/actualizado exitosamente para el tenant '${tenant.slug}'.`);
}

main()
  .catch(e => {
    console.error("Error ejecutando el script:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
