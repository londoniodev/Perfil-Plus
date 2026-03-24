import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import { join } from 'path';

// Cargar variables de entorno desde apps/api/.env
dotenv.config({ path: join(process.cwd(), 'apps/api/.env') });

const prisma = new PrismaClient();

async function auditCors() {
  console.log('🔍 Auditando orígenes CORS en la base de datos...');
  
  const mainDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'xn--alvarolondoo-khb.dev';
  
  try {
    const tenants = await prisma.tenant.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        slug: true,
        domain: true,
        name: true,
      },
    });

    console.log(`\n✅ Se encontraron ${tenants.length} tenants activos.\n`);
    
    const tableData = tenants.map(t => {
      const origins: string[] = [];
      if (t.slug) origins.push(`https://${t.slug}.${mainDomain}`);
      if (t.domain) origins.push(`https://${t.domain}`);
      
      return {
        Tenant: t.name || t.slug,
        Slug: t.slug,
        CustomDomain: t.domain || 'N/A',
        AllowedOrigins: origins.join(', ')
      };
    });

    console.table(tableData);
    
    console.log('\n💡 Nota: El CorsCacheService normaliza estos dominios a Punycode si contienen caracteres especiales.');
    
  } catch (error: any) {
    console.error('❌ Error al consultar la base de datos:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

auditCors();
