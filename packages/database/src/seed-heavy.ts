import { PrismaClient, ProductType } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();
const TENANT_ID = 'test-tenant-heavy';
const BATCH_SIZE = 5000;
const TOTAL_PRODUCTS = 50000;

async function main() {
  console.log('🌱 Buscando/creando el tenant:', TENANT_ID);
  
  // 1. Ensure Tenant exists or Clean up
  let tenant = await prisma.tenant.findUnique({ where: { id: TENANT_ID } });
  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: {
        id: TENANT_ID,
        name: 'Heavy Stress Test Tenant',
        slug: 'test-tenant-heavy',
        dbName: 'public',
        status: 'ACTIVE',
        features: ['RESTAURANT', 'DASHBOARD'],
      },
    });
    console.log('✅ Tenant creado.');
  } else {
    console.log('🧹 Tenant existente. Limpiando productos antiguos para evitar duplicados...');
    await prisma.product.deleteMany({ where: { tenantId: TENANT_ID } });
    console.log('✅ Base de datos limpia (Productos eliminados).');
  }

  const productsToCreate = TOTAL_PRODUCTS;
  console.log(`🚀 Iniciando generación masiva de ${productsToCreate} productos...`);

  // Descripciones largas simuladas para peso
  const longDescription = 'Esta es una camisa muy cómoda y elegante que cuenta con múltiples tallas y colores. Perfecta para usar en eventos corporativos y salidas casuales. Fabricada con materiales de alta durabilidad que garantizan años de uso. '.repeat(10); // Unos 200 caracteres x 10 = 2000 caracteres

  let currentTotal = 0;
  
  while (currentTotal < productsToCreate) {
    const chunk = Math.min(BATCH_SIZE, productsToCreate - currentTotal);
    
    // Generar datos en memoria
    const productsData = [];
    const variantsData = [];

    for (let i = 0; i < chunk; i++) {
      const productId = uuidv4();
      const productNo = currentTotal + i + 1;
      // Una palabra clave común para que la búsqueda "camisa" retorne bastantes, pero mezclada con otras cosas
      const name = productNo % 3 === 0 ? `Camisa Heavy ${productNo}` : `Producto Generico ${productNo}`; 
      
      productsData.push({
        id: productId,
        name: name,
        slug: `prod-heavy-${productNo}-${uuidv4().slice(0, 8)}`,
        description: longDescription,
        productType: ProductType.RESTAURANT, // Or PHYSICAL, RESTAURANT satisfies some rules
        basePrice: Math.floor(Math.random() * 1000) + 10,
        published: true,
        tenantId: TENANT_ID,
      });

      // 2 Variants per product
      variantsData.push({
        id: uuidv4(),
        productId: productId,
        sku: `SKU-${productNo}-A`,
        name: 'Variante A',
        price: 15,
        stock: 100,
        isDefault: true,
        tenantId: TENANT_ID,
      });
      variantsData.push({
        id: uuidv4(),
        productId: productId,
        sku: `SKU-${productNo}-B`,
        name: 'Variante B',
        price: 25,
        stock: 50,
        isDefault: false,
        tenantId: TENANT_ID,
      });
    }

    // Insert to DB using createMany
    console.log(`📦 Insertando lote de ${chunk} productos y ${chunk * 2} variantes... (${currentTotal}/${productsToCreate})`);
    
    await prisma.$transaction([
      prisma.product.createMany({ data: productsData, skipDuplicates: true }),
      prisma.productVariant.createMany({ data: variantsData, skipDuplicates: true })
    ]);

    currentTotal += chunk;
  }

  console.log('🎉 Seeding Heavy completado con éxito.');

  // Obtener tamaño en disco de la tabla Product
  try {
    const result = await prisma.$queryRaw`SELECT pg_size_pretty(pg_total_relation_size('"Product"')) as size;`;
    const resultVariants = await prisma.$queryRaw`SELECT pg_size_pretty(pg_total_relation_size('"ProductVariant"')) as size;`;
    
    console.log('====================================');
    console.log(`📊 TAMAÑO FINAL EN DISCO POSTGRESQL`);
    console.log(`- Tabla Product:         ${(result as any)[0].size}`);
    console.log(`- Tabla ProductVariant:  ${(resultVariants as any)[0].size}`);
    console.log('====================================');
  } catch (error) {
    console.log('⚠️ No se pudo obtener el tamaño de la tabla (requiere permisos en Postgres).');
  }
}

main()
  .catch((e) => {
    console.error('❌ Error en el seeding heavy:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
