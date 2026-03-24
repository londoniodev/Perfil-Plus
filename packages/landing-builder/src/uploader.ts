import * as fs from "node:fs/promises";
import * as path from "node:path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { lookup as mimeTypeLookup } from "mime-types";

// ─────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────

interface UploaderConfig {
  tenantSlug: string;
  landingSlug: string;
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

  const mutated = bodyHtml.replace(/\.\/assets\//g, cdnBase);

  log("🔗", `Mutated asset paths → ${cdnBase}`);
  return mutated;
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

  // 8. Fire revalidation webhook
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    const secret = process.env.REVALIDATION_SECRET;

    if (!appUrl || !secret) {
      log("⚠️", "Upload succeeded, but cache revalidation skipped: Missing NEXT_PUBLIC_APP_URL or REVALIDATION_SECRET");
    } else {
      const webhookUrl = `${appUrl}/api/webhooks/revalidate`;
      log("🔄", `Firing revalidation webhook: ${webhookUrl}`);
      
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${secret}`,
        },
        body: JSON.stringify({ tag: `landings-${tenantSlug}` }),
      });

      if (!response.ok) {
        log("⚠️", `Upload succeeded, but cache revalidation failed (${response.status}). The old version might still be served.`);
      } else {
        log("⚡", `Cache revalidated successfully for tag: landings-${tenantSlug}`);
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
