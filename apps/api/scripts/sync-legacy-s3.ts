/**
 * Script One-Off: Sincronización S3 -> DB (Legacy Tenants)
 * 
 * Escanea los buckets de MinIO para encontrar landings existentes
 * y registra los enlaces en SystemSetting.menu.headerLinks usando
 * la lógica de Upsert Semántico.
 * 
 * Ejecución: npx tsx scripts/sync-legacy-s3.ts
 */

import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { PrismaClient } from '@prisma/client';

// ── Config ──
const S3_ENDPOINT = process.env.S3_ENDPOINT || 'https://s3.perfil.plus';
const S3_REGION = 'us-east-1';
const S3_ACCESS_KEY = 'minioadmin';
const S3_SECRET_KEY = 'KJ<?k53Q8XG5Tj5sV2CXe}R4t$*ZgVBi';

const tenants = ['mauromera', 'cocinasiete', 'soydeborasoysaludable'];

// ── Helpers ──
function getStorageSlug(slug: string): string {
  if (!slug) return 'default';
  return slug.toLowerCase().replace(/[^a-z0-9-]/g, '');
}

function getBucketName(slug: string): string {
  return `${getStorageSlug(slug)}-public`;
}

function slugToLabel(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// ── Main ──
async function main() {
  console.log('═══════════════════════════════════════════════');
  console.log('  SYNC S3 LANDINGS → DB (Legacy Tenants)');
  console.log('═══════════════════════════════════════════════\n');

  const prisma = new PrismaClient();
  const s3 = new S3Client({
    endpoint: S3_ENDPOINT,
    region: S3_REGION,
    credentials: {
      accessKeyId: S3_ACCESS_KEY,
      secretAccessKey: S3_SECRET_KEY,
    },
    forcePathStyle: true,
  });

  try {
    for (const tenantSlug of tenants) {
      const bucket = getBucketName(tenantSlug);
      console.log(`\n┌─── Tenant: ${tenantSlug} (bucket: ${bucket}) ───`);

      // 1. Buscar el tenant en la DB
      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
        select: { id: true, slug: true },
      });

      if (!tenant) {
        console.log(`│  ⚠️  Tenant no encontrado en DB. Saltando.`);
        console.log(`└───────────────────────────────────────────\n`);
        continue;
      }

      // 2. Listar objetos en S3 con prefijo landings/
      let landingSlugs: string[] = [];
      try {
        const listResult = await s3.send(
          new ListObjectsV2Command({
            Bucket: bucket,
            Prefix: 'landings/',
          }),
        );

        if (!listResult.Contents || listResult.Contents.length === 0) {
          console.log(`│  📭 No hay landings en S3.`);
          console.log(`└───────────────────────────────────────────\n`);
          continue;
        }

        // Extraer slugs únicos de las rutas (landings/{slug}/body.html -> slug)
        const slugSet = new Set<string>();
        for (const obj of listResult.Contents) {
          const match = obj.Key?.match(/^landings\/([^/]+)\//);
          if (match && match[1]) {
            slugSet.add(match[1]);
          }
        }
        landingSlugs = Array.from(slugSet);
        console.log(`│  📦 Encontrados ${landingSlugs.length} slug(s): [${landingSlugs.join(', ')}]`);
      } catch (err: any) {
        console.log(`│  ❌ Error listando S3: ${err.message}`);
        console.log(`└───────────────────────────────────────────\n`);
        continue;
      }

      // 3. Filtrar home/inicio
      const validSlugs = landingSlugs.filter(
        (s) => s !== 'home' && s !== 'inicio',
      );

      if (validSlugs.length === 0) {
        console.log(`│  ℹ️  Solo hay 'home'/'inicio'. No se necesitan links adicionales.`);
        console.log(`└───────────────────────────────────────────\n`);
        continue;
      }

      // 4. Leer configuración actual del menú
      const setting = await prisma.systemSetting.findFirst({
        where: { tenantId: tenant.id, key: 'menu' },
      });

      const menuData = (setting?.value as Record<string, any>) || {};
      let currentLinks: { label: string; href: string }[] = Array.isArray(
        menuData.headerLinks,
      )
        ? menuData.headerLinks
        : [];

      // 5. Upsert Semántico por cada slug
      let changed = false;
      for (const slug of validSlugs) {
        const targetHref = `/${slug}`;
        const resolvedLabel = slugToLabel(slug);
        const existingIndex = currentLinks.findIndex(
          (l) => l.href === targetHref,
        );

        if (existingIndex >= 0) {
          // Actualizar label si cambió
          if (currentLinks[existingIndex].label !== resolvedLabel) {
            console.log(
              `│  🔄 Actualizado: "${currentLinks[existingIndex].label}" → "${resolvedLabel}" (${targetHref})`,
            );
            currentLinks[existingIndex] = {
              ...currentLinks[existingIndex],
              label: resolvedLabel,
            };
            changed = true;
          } else {
            console.log(
              `│  ✅ Ya existe: "${resolvedLabel}" (${targetHref})`,
            );
          }
        } else {
          // Push nuevo
          currentLinks.push({ label: resolvedLabel, href: targetHref });
          console.log(
            `│  ➕ Nuevo link: "${resolvedLabel}" (${targetHref})`,
          );
          changed = true;
        }
      }

      // 6. Persistir si hubo cambios
      if (changed) {
        const updatedMenu = { ...menuData, headerLinks: currentLinks };
        await prisma.systemSetting.upsert({
          where: {
            tenantId_key: {
              tenantId: tenant.id,
              key: 'menu',
            },
          },
          update: { value: updatedMenu },
          create: {
            tenantId: tenant.id,
            key: 'menu',
            value: updatedMenu,
            isPublic: true,
          },
        });
        console.log(`│  💾 DB actualizada con ${currentLinks.length} links.`);
      } else {
        console.log(`│  ⏩ Sin cambios necesarios.`);
      }

      console.log(`└───────────────────────────────────────────\n`);
    }
  } finally {
    await prisma.$disconnect();
  }

  console.log('═══════════════════════════════════════════════');
  console.log('  SINCRONIZACIÓN COMPLETADA');
  console.log('═══════════════════════════════════════════════');
}

main().catch((err) => {
  console.error('FATAL:', err);
  process.exit(1);
});
