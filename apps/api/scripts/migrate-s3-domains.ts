/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  Script de Migración S3: Dominio Legacy → Dominio Actual
 * ─────────────────────────────────────────────────────────────────────────────
 *  
 *  Propósito:
 *    Recorre todos los buckets terminados en "-public" en MinIO/S3,
 *    descarga cada archivo body.html dentro de landings/,
 *    reemplaza las URLs del dominio S3 viejo por el dominio actual,
 *    y vuelve a subir el archivo corregido.
 *
 *  Uso:
 *    npx tsx apps/api/scripts/migrate-s3-domains.ts [--dry-run]
 *
 *  Variables de entorno requeridas (o usa el .env del landing-builder):
 *    S3_ENDPOINT      - Endpoint de MinIO (ej: https://s3.perfil.plus)
 *    S3_ACCESS_KEY     - Access Key
 *    S3_SECRET_KEY     - Secret Key
 *    S3_PUBLIC_URL     - URL pública base, la que DEBE quedar en los archivos
 *    S3_REGION         - Región (default: us-east-1)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { config as dotenvConfig } from 'dotenv';
import * as path from 'node:path';

// Carga de .env en cascada (misma estrategia que el cli-upload del builder)
dotenvConfig({ path: path.resolve(__dirname, '../../../packages/landing-builder/.env') });
dotenvConfig({ path: path.resolve(__dirname, '../../../.env') });
dotenvConfig({ path: path.resolve(__dirname, '../.env') });

import {
  S3Client,
  ListBucketsCommand,
  ListObjectsV2Command,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';

// ── Configuration ──
const S3_ENDPOINT = process.env.S3_ENDPOINT || process.env.S3_PUBLIC_URL || 'http://localhost:9000';
const S3_REGION = process.env.S3_REGION || 'us-east-1';
const S3_ACCESS_KEY = process.env.S3_ACCESS_KEY || process.env.MINIO_ROOT_USER || '';
const S3_SECRET_KEY = process.env.S3_SECRET_KEY || process.env.MINIO_ROOT_PASSWORD || '';
const S3_PUBLIC_URL = process.env.S3_PUBLIC_URL || S3_ENDPOINT;
const DRY_RUN = process.argv.includes('--dry-run');

// ── Dominios legacy a reemplazar ──
const LEGACY_DOMAINS: RegExp[] = [
  /https?:\/\/s3\.xn--alvarolondoo-khb\.dev/g,     // Punycode legacy
  /https?:\/\/s3\.alvarolondo[ñn]o\.dev/g,          // Unicode legacy
  /https?:\/\/localhost:9000/g,                       // Dev local
];

// ── Logging ──
function log(emoji: string, msg: string): void {
  console.log(`${emoji}  ${msg}`);
}

function logSection(title: string): void {
  const line = '─'.repeat(50);
  console.log(`\n${line}`);
  console.log(`  ${title}`);
  console.log(`${line}`);
}

// ── S3 Helpers ──
async function streamToString(stream: any): Promise<string> {
  const chunks: Uint8Array[] = [];
  for await (const chunk of stream) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks).toString('utf-8');
}

function replaceDomainsInHtml(html: string, targetUrl: string): { result: string; replacementsCount: number } {
  let replacementsCount = 0;
  let result = html;

  for (const pattern of LEGACY_DOMAINS) {
    // Resetear lastIndex por si la regex es global con estado
    pattern.lastIndex = 0;
    const matches = result.match(pattern);
    if (matches) {
      replacementsCount += matches.length;
    }
    result = result.replace(pattern, targetUrl);
  }

  return { result, replacementsCount };
}

// ── Main ──
async function main(): Promise<void> {
  logSection('🔧 Migración de Dominios S3 en Landings');

  if (DRY_RUN) {
    log('🏳️', 'MODO DRY-RUN: No se modificará ningún archivo en S3');
  }

  log('🔗', `S3 Endpoint: ${S3_ENDPOINT}`);
  log('🌐', `Nuevo dominio público: ${S3_PUBLIC_URL}`);
  log('🔍', `Patrones legacy a buscar: ${LEGACY_DOMAINS.length}`);
  console.log('');

  // Validar credenciales
  if (!S3_ACCESS_KEY || !S3_SECRET_KEY) {
    log('❌', 'Faltan credenciales S3 (S3_ACCESS_KEY / S3_SECRET_KEY)');
    process.exit(1);
  }

  const s3 = new S3Client({
    endpoint: S3_ENDPOINT,
    region: S3_REGION,
    credentials: {
      accessKeyId: S3_ACCESS_KEY,
      secretAccessKey: S3_SECRET_KEY,
    },
    forcePathStyle: true,
  });

  // 1. Listar todos los buckets
  log('📋', 'Listando buckets...');
  const bucketsResponse = await s3.send(new ListBucketsCommand({}));
  const allBuckets = bucketsResponse.Buckets || [];
  const publicBuckets = allBuckets.filter((b) => b.Name?.endsWith('-public'));

  log('🪣', `Buckets totales: ${allBuckets.length} | Públicos (*-public): ${publicBuckets.length}`);

  if (publicBuckets.length === 0) {
    log('⚠️', 'No se encontraron buckets terminados en "-public". Nada que migrar.');
    process.exit(0);
  }

  let totalFilesScanned = 0;
  let totalFilesModified = 0;
  let totalReplacements = 0;
  let totalFilesSkipped = 0;

  // 2. Iterar por cada bucket público
  for (const bucket of publicBuckets) {
    const bucketName = bucket.Name!;
    logSection(`🪣 Bucket: ${bucketName}`);

    // 3. Listar objetos dentro de landings/
    const listResponse = await s3.send(
      new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: 'landings/',
      }),
    );

    const objects = listResponse.Contents || [];
    const bodyHtmlFiles = objects.filter((obj) => obj.Key?.endsWith('/body.html'));

    if (bodyHtmlFiles.length === 0) {
      log('⏭️', `No se encontraron body.html en ${bucketName}/landings/`);
      continue;
    }

    log('📄', `Archivos body.html encontrados: ${bodyHtmlFiles.length}`);

    // 4. Procesar cada body.html
    for (const obj of bodyHtmlFiles) {
      const key = obj.Key!;
      totalFilesScanned++;

      // Descargar contenido
      const getResponse = await s3.send(
        new GetObjectCommand({
          Bucket: bucketName,
          Key: key,
        }),
      );

      const originalHtml = await streamToString(getResponse.Body);
      const { result: migratedHtml, replacementsCount } = replaceDomainsInHtml(
        originalHtml,
        S3_PUBLIC_URL,
      );

      if (replacementsCount === 0) {
        log('✅', `${key} — Sin cambios necesarios`);
        totalFilesSkipped++;
        continue;
      }

      log('🔄', `${key} — ${replacementsCount} reemplazo(s) encontrado(s)`);
      totalReplacements += replacementsCount;

      if (DRY_RUN) {
        log('🏳️', `  [DRY-RUN] Se omitiría re-subida de ${key}`);
        totalFilesModified++;
        continue;
      }

      // 5. Re-subir el archivo corregido
      await s3.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: key,
          Body: migratedHtml,
          ContentType: 'text/html; charset=utf-8',
          CacheControl: 'public, max-age=3600, s-maxage=3600',
        }),
      );

      log('⬆️', `  Re-subido: ${bucketName}/${key}`);
      totalFilesModified++;
    }
  }

  // 6. Resumen final
  logSection('📊 Resumen de Migración');
  log('📋', `Buckets procesados:    ${publicBuckets.length}`);
  log('📄', `Archivos escaneados:   ${totalFilesScanned}`);
  log('🔄', `Archivos modificados:  ${totalFilesModified}`);
  log('✅', `Archivos sin cambios:  ${totalFilesSkipped}`);
  log('🔗', `Reemplazos totales:    ${totalReplacements}`);
  log('🌐', `Nuevo dominio:         ${S3_PUBLIC_URL}`);

  if (DRY_RUN) {
    log('🏳️', '(DRY-RUN) — Ningún archivo fue modificado realmente.');
    log('💡', 'Para ejecutar de verdad: npx tsx apps/api/scripts/migrate-s3-domains.ts');
  } else if (totalFilesModified > 0) {
    log('🎉', '¡Migración completada exitosamente!');
    log('💡', 'Recuerda purgar el caché de Next.js (ISR) si usas force-cache en los fetches de landing.');
  } else {
    log('✅', 'Todos los archivos ya estaban actualizados. Sin cambios necesarios.');
  }
}

main().catch((err) => {
  log('❌', `Error fatal: ${err.message || err}`);
  if (err.stack) console.error(err.stack);
  process.exit(1);
});
