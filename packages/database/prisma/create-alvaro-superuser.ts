import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.findUnique({
    where: { slug: 'alvarolondono' },
  });

  if (!tenant) {
    throw new Error('Tenant alvarolondono no encontrado en DB');
  }

  // 1. Activar Feature 'dashboard' si no está
  const currentFeatures = tenant.features || [];
  if (!currentFeatures.includes('dashboard') && !currentFeatures.includes('DASHBOARD')) {
    currentFeatures.push('dashboard');
    await prisma.tenant.update({
      where: { id: tenant.id },
      data: { features: currentFeatures },
    });
    console.log('✅ Feature dashboard habilitada para el tenant');
  }

  // 2. Crear Usuario SuperAdmin
  const hashedPassword = await bcrypt.hash('AlvaroSuper2026!', 10); 

  // Verificar si ya existe
  const existingUser = await prisma.user.findFirst({
    where: { tenantId: tenant.id, email: 'soy@xn--alvarolondoo-khb.dev' }
  });

  if (existingUser) {
    console.log('⚠️ El usuario ya existe, actualizando a SUPERADMIN...');
    await prisma.user.update({
      where: { id: existingUser.id },
      data: { role: 'SUPERADMIN' }
    });
    console.log('✅ Usuario actualizado s SUPERADMIN');
    return;
  }

  const user = await prisma.user.create({
    data: {
      email: 'soy@xn--alvarolondoo-khb.dev',
      password: hashedPassword,
      name: 'Alvaro Londoño',
      role: 'SUPERADMIN',
      tenantId: tenant.id,
      emailVerified: true,
    },
  });

  console.log('✅ Usuario SuperAdmin creado exitosamente:', user.email);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
