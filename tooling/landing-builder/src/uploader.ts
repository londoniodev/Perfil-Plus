import * as fs from "node:fs/promises";
import * as path from "node:path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { lookup as mimeTypeLookup } from "mime-types";
import pg from 'pg';
const { Client } = pg;

// ─────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────

interface UploaderConfig {
  tenantSlug: string;
  landingSlug: string;
  domain?: string; // Opcional: Dominio del tenant para revalidación automática
  label?: string;  // Opcional: Etiqueta para el menú en la base de datos
}

interface UploadResult {
  bucket: string;
  filesUploaded: number;
  bodyKey: string;
  metaKey: string;
  publicUrl: string;
}

interface S3EnvConfig {
  endpoint: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  publicUrl: string;
}

// ─────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────

function log(emoji: string, message: string): void {
  console.log(`${emoji}  ${message}`);
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function loadS3Config(): S3EnvConfig {
  return {
    endpoint: process.env.S3_ENDPOINT || process.env.S3_PUBLIC_URL || "http://localhost:9000",
    region: process.env.S3_REGION || "us-east-1",
    accessKeyId: process.env.S3_ACCESS_KEY || requireEnv("MINIO_ROOT_USER"),
    secretAccessKey: process.env.S3_SECRET_KEY || requireEnv("MINIO_ROOT_PASSWORD"),
    publicUrl: requireEnv("S3_PUBLIC_URL"),
  };
}

function resolveContentType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const detected = mimeTypeLookup(ext);

  if (detected) return detected;

  const fallbacks: Record<string, string> = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".webp": "image/webp",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".json": "application/json",
    ".woff2": "font/woff2",
    ".woff": "font/woff",
  };

  return fallbacks[ext] || "application/octet-stream";
}

// ─────────────────────────────────────────────
//  Path Mutation (relative → absolute CDN URLs)
// ─────────────────────────────────────────────

function mutateBodyForProduction(
  bodyHtml: string,
  publicBaseUrl: string,
  tenantSlug: string,
  landingSlug: string,
): string {
  const cdnBase = `${publicBaseUrl}/${tenantSlug}-public/landings/${landingSlug}/assets/`;

  // 1. Reemplazo de href="./assets/" y src="./assets/"
  let mutated = bodyHtml.replace(/(href|src)=["']\.\/assets\//g, `$1="${cdnBase}`);
  
  // 2. Reemplazo de url('./assets/...') o url("./assets/...") en estilos inline (ej: parallax)
  mutated = mutated.replace(/url\(["']\.\/assets\//g, `url('${cdnBase}`);

  log("🔗", `Mutated asset paths → ${cdnBase}`);
  return mutated;
}

// ─────────────────────────────────────────────
//  Menu Sync (Database)
// ─────────────────────────────────────────────

async function syncMenu(tenantSlug: string, landingSlug: string, label?: string): Promise<any> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    log("⚠️", "Menu sync skipped: DATABASE_URL not set in environment.");
    return null;
  }

  const client = new Client({ connectionString: databaseUrl });
  let tenant = null;
  try {
    await client.connect();
    
    // 1. Find Tenant
    const tenantRes = await client.query('SELECT id, features, domain FROM "Tenant" WHERE slug = $1', [tenantSlug]);
    if (tenantRes.rows.length === 0) {
      log("⚠️", `Tenant ${tenantSlug} not found in DB. Menu sync skipped.`);
      return null;
    }
    tenant = tenantRes.rows[0];

    // 2. Ensure LANDING feature
    if (!tenant.features.includes('LANDING')) {
      log("➕", "Activating LANDING feature for tenant...");
      await client.query('UPDATE "Tenant" SET features = $1 WHERE id = $2', [[...tenant.features, 'LANDING'], tenant.id]);
    }

    // 3. Get current menu
    const settingRes = await client.query('SELECT value FROM "SystemSetting" WHERE "tenantId" = $1 AND key = $2', [tenant.id, 'menu']);
    const menuData = settingRes.rows.length > 0 ? settingRes.rows[0].value : {};
    const currentLinks = Array.isArray(menuData.headerLinks) ? menuData.headerLinks : [];

    // 4. Upsert Link
    const targetHref = `/${landingSlug}`;
    const targetLabel = label || landingSlug.charAt(0).toUpperCase() + landingSlug.slice(1);
    
    let updatedLinks = [...currentLinks];
    const existingIndex = updatedLinks.findIndex(l => l.href === targetHref);
    
    if (existingIndex >= 0) {
      updatedLinks[existingIndex].label = targetLabel;
    } else {
      updatedLinks.push({ label: targetLabel, href: targetHref });
    }

    const newId = `id_${Math.random().toString(36).substr(2, 9)}`;
    await client.query(`
        INSERT INTO "SystemSetting" ("id", "tenantId", "key", "value", "isPublic", "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
        ON CONFLICT ("tenantId", "key") DO UPDATE SET "value" = $4, "updatedAt" = NOW()
    `, [newId, tenant.id, 'menu', JSON.stringify({ ...menuData, headerLinks: updatedLinks }), true]);

    log("🚀", `Menu synchronized: "${targetLabel}" → ${targetHref}`);
  } catch (err: any) {
    log("❌", `DB Sync Error: ${err.message}`);
  } finally {
    await client.end();
  }
  return tenant;
}

// ─────────────────────────────────────────────
//  Main Upload Logic
// ─────────────────────────────────────────────

export async function uploadLanding(config: UploaderConfig): Promise<UploadResult> {
  const { tenantSlug, landingSlug } = config;

  // 1. Validate local workspace exists
  const workspaceDir = path.resolve(".local-landings", tenantSlug, landingSlug);
  const localBodyPath = path.join(workspaceDir, "body.html");
  const localMetaPath = path.join(workspaceDir, "meta.json");
  const localAssetsDir = path.join(workspaceDir, "assets");

  const bodyExists = await fs.access(localBodyPath).then(() => true).catch(() => false);
  if (!bodyExists) {
    throw new Error(
      `Local workspace not found: ${workspaceDir}\n` +
      `Expected file: body.html\n` +
      `Run the processor first:\n` +
      `  npx tsx src/cli.ts <input.html> -t ${tenantSlug} -l ${landingSlug}`
    );
  }

  const metaExists = await fs.access(localMetaPath).then(() => true).catch(() => false);
  if (!metaExists) {
    throw new Error(
      `meta.json not found in workspace: ${workspaceDir}\n` +
      `Re-run the processor to regenerate it.`
    );
  }

  log("📁", `Workspace: ${workspaceDir}`);

  // 2. Load S3 config from environment
  const s3Config = loadS3Config();
  log("🔧", `S3 Endpoint: ${s3Config.endpoint}`);
  log("🌐", `Public URL: ${s3Config.publicUrl}`);

  // 3. Initialize S3 client
  const s3 = new S3Client({
    endpoint: s3Config.endpoint,
    region: s3Config.region,
    credentials: {
      accessKeyId: s3Config.accessKeyId,
      secretAccessKey: s3Config.secretAccessKey,
    },
    forcePathStyle: true, // CRITICAL for MinIO
  });

  const bucket = `${tenantSlug}-public`;
  log("🪣", `Target bucket: ${bucket}`);

  // 3.5 Ensure bucket exists (best effort)
  try {
    const { CreateBucketCommand, HeadBucketCommand } = await import("@aws-sdk/client-s3");
    try {
        await s3.send(new HeadBucketCommand({ Bucket: bucket }));
    } catch {
        log("🆕", `Creating missing bucket: ${bucket}`);
        await s3.send(new CreateBucketCommand({ Bucket: bucket }));
    }
  } catch (err) {
    log("⚠️", `Could not verify/create bucket ${bucket}. Proceeding anyway.`);
  }

  let filesUploaded = 0;

  // 4. Read and mutate body.html for production
  const localBody = await fs.readFile(localBodyPath, "utf-8");
  const productionBody = mutateBodyForProduction(
    localBody,
    s3Config.publicUrl,
    tenantSlug,
    landingSlug,
  );

  // 5. Upload the MUTATED body.html
  const bodyKey = `landings/${landingSlug}/body.html`;
  log("⬆️", `Uploading: ${bodyKey} (text/html)`);

  await s3.send(new PutObjectCommand({
    Bucket: bucket,
    Key: bodyKey,
    Body: productionBody,
    ContentType: "text/html; charset=utf-8",
    CacheControl: "public, max-age=3600, s-maxage=3600",
  }));
  filesUploaded++;

  // 6. Upload meta.json (no mutation needed — it contains no asset paths)
  const metaKey = `landings/${landingSlug}/meta.json`;
  const metaContent = await fs.readFile(localMetaPath, "utf-8");
  log("⬆️", `Uploading: ${metaKey} (application/json)`);

  await s3.send(new PutObjectCommand({
    Bucket: bucket,
    Key: metaKey,
    Body: metaContent,
    ContentType: "application/json; charset=utf-8",
    CacheControl: "public, max-age=3600, s-maxage=3600",
  }));
  filesUploaded++;

  // 7. Upload all assets
  const assetsExist = await fs.access(localAssetsDir).then(() => true).catch(() => false);
  if (assetsExist) {
    const assetFiles = await fs.readdir(localAssetsDir);

    for (const filename of assetFiles) {
      const filePath = path.join(localAssetsDir, filename);
      const stat = await fs.stat(filePath);

      if (!stat.isFile()) continue;

      const assetKey = `landings/${landingSlug}/assets/${filename}`;
      const contentType = resolveContentType(filename);
      const fileBuffer = await fs.readFile(filePath);

      log("⬆️", `Uploading: ${assetKey} (${contentType}, ${(stat.size / 1024).toFixed(1)} KB)`);

      await s3.send(new PutObjectCommand({
        Bucket: bucket,
        Key: assetKey,
        Body: fileBuffer,
        ContentType: contentType,
        CacheControl: "public, max-age=31536000, immutable",
      }));
      filesUploaded++;
    }
  }

  const publicUrl = `${s3Config.publicUrl}/${bucket}/${bodyKey}`;

  // 8. Sync Menu (New)
  const tenant = await syncMenu(tenantSlug, landingSlug, config.label);

  // 9. Fire revalidation webhook
  try {
    const secret = process.env.REVALIDATION_SECRET;
    // Prioridad: 1. Argumento --domain, 2. Env NEXT_PUBLIC_APP_URL, 3. Fallback perfil.plus
    let appUrl = config.domain || process.env.NEXT_PUBLIC_APP_URL || "https://perfil.plus";

    if (!secret) {
      log("⚠️", "Upload succeeded, but cache revalidation skipped: Missing REVALIDATION_SECRET");
    } else {
      // Normalización de URL
      if (!appUrl.startsWith("http")) appUrl = `https://${appUrl}`;
      appUrl = appUrl.replace(/\/+$/, ""); // Quitar slash final

      const webhookUrl = `${appUrl}/api/revalidate`;
      
      // Tags a revalidar: la landing específica, el branding del tenant (con ID), y la resolución del edge proxy (con dominio)
      // La API Next.js usa tenantId (CUID) para el branding, y el dominio para la resolución del middleware.
      const tags = [
        `landings-${tenantSlug}`
      ];

      if (tenant) {
        tags.push(`tenant-branding-${tenant.id}`);
        tags.push(`tenant-brand-${tenant.id}`);
        tags.push(`tenant-${tenant.id}-branding`);
      }

      // Opcionalmente agregar el dominio de revalidación del middleware si se conoce
      if (tenant?.domain) {
         tags.push(`tenant-resolve-${tenant.domain}`);
         if (tenant.domain.startsWith('www.')) {
             tags.push(`tenant-resolve-${tenant.domain.substring(4)}`);
         } else {
             tags.push(`tenant-resolve-www.${tenant.domain}`);
         }
      }

      for (const tag of tags) {
        log("🔄", `Firing revalidation webhook for tag: ${tag}`);
        
        const response = await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-revalidate-secret": secret,
          },
          body: JSON.stringify({ tag }),
        });

        if (!response.ok) {
          log("⚠️", `Revalidation failed for tag ${tag} (${response.status}).`);
        } else {
          log("⚡", `Cache revalidated successfully: ${tag}`);
        }
      }
    }
  } catch (error) {
    log("⚠️", `Upload succeeded, but cache revalidation request failed. The old version might still be served.`);
  }

  log("", "─────────────────────────────────────");
  log("🎉", "Upload complete!");
  log("📊", `Files uploaded: ${filesUploaded}`);
  log("🌐", `Body URL: ${publicUrl}`);
  log("📋", `Meta URL: ${s3Config.publicUrl}/${bucket}/${metaKey}`);
  log("", "─────────────────────────────────────");

  return {
    bucket,
    filesUploaded,
    bodyKey,
    metaKey,
    publicUrl,
  };
}
