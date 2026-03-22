import * as fs from "node:fs/promises";
import * as path from "node:path";
import { Buffer } from "node:buffer";
import * as cheerio from "cheerio";
import sharp from "sharp";
import axios from "axios";
import postcss from "postcss";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
import cssnano from "cssnano";
import { JSDOM } from "jsdom";
import DOMPurify from "dompurify";

// ─────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────

interface ProcessorConfig {
  /** Absolute path to the input HTML file */
  inputHtmlPath: string;
  /** Absolute path to the output directory (created if not exists) */
  outputDir: string;
  /** WebP quality (1-100) */
  webpQuality: number;
}

interface LandingMeta {
  title: string;
  description: string;
  og: Record<string, string>;
}

interface ProcessingResult {
  outputBodyPath: string;
  outputMetaPath: string;
  outputCssPath: string;
  totalImagesProcessed: number;
  base64ImagesConverted: number;
  externalImagesDownloaded: number;
  originalSizeBytes: number;
  finalBodySizeBytes: number;
}

// ─────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────

function log(emoji: string, message: string): void {
  console.log(`${emoji}  ${message}`);
}

// ─────────────────────────────────────────────
//  Step 1 — Base64 Image Extraction
// ─────────────────────────────────────────────

async function extractBase64Images(
  $: cheerio.CheerioAPI,
  assetsDir: string,
  quality: number,
): Promise<number> {
  const base64Imgs = $("img").filter((_i, el) => {
    const src = $(el).attr("src") || "";
    return src.startsWith("data:image/");
  });

  let count = 0;

  for (let i = 0; i < base64Imgs.length; i++) {
    const el = base64Imgs[i];
    if (!el) continue;

    const src = $(el).attr("src");
    if (!src) continue;

    try {
      const matches = src.match(/^data:image\/([^;]+);base64,(.+)$/);
      if (!matches || !matches[2]) {
        log("⚠️", `Skipping malformed base64 image #${i + 1}`);
        continue;
      }

      const buffer = Buffer.from(matches[2], "base64");
      const filename = `img-b64-${i + 1}.webp`;
      const outputPath = path.join(assetsDir, filename);

      await sharp(buffer)
        .webp({ quality })
        .toFile(outputPath);

      $(el).attr("src", `./assets/${filename}`);
      count++;
      log("🖼️", `Base64 image #${i + 1} → ${filename} (${(buffer.length / 1024).toFixed(0)} KB → webp)`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      log("❌", `Failed to process base64 image #${i + 1}: ${message}`);
    }
  }

  return count;
}

// ─────────────────────────────────────────────
//  Step 2 — External Image Downloading
// ─────────────────────────────────────────────

async function downloadExternalImages(
  $: cheerio.CheerioAPI,
  assetsDir: string,
  quality: number,
): Promise<number> {
  const externalImgs = $("img").filter((_i, el) => {
    const src = $(el).attr("src") || "";
    return src.startsWith("http://") || src.startsWith("https://");
  });

  let count = 0;

  for (let i = 0; i < externalImgs.length; i++) {
    const el = externalImgs[i];
    if (!el) continue;

    const src = $(el).attr("src");
    if (!src) continue;

    try {
      log("⬇️", `Downloading external image #${i + 1}: ${src.slice(0, 80)}...`);

      const response = await axios.get<ArrayBuffer>(src, {
        responseType: "arraybuffer",
        timeout: 30_000,
      });

      const buffer = Buffer.from(response.data);
      const filename = `img-ext-${i + 1}.webp`;
      const outputPath = path.join(assetsDir, filename);

      await sharp(buffer)
        .webp({ quality })
        .toFile(outputPath);

      $(el).attr("src", `./assets/${filename}`);
      count++;
      log("✅", `External image #${i + 1} → ${filename}`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      log("❌", `Failed to download external image #${i + 1} (${src.slice(0, 60)}): ${message}`);
    }
  }

  return count;
}

// ─────────────────────────────────────────────
//  Step 3 — Remove Tailwind CDN Scripts
// ─────────────────────────────────────────────

function removeTailwindCdnScripts($: cheerio.CheerioAPI): string[] {
  const inlineStyles: string[] = [];

  $('script[src*="cdn.tailwindcss.com"]').each((_i, el) => {
    log("🗑️", `Removed Tailwind CDN script: ${$(el).attr("src")}`);
    $(el).remove();
  });

  $("script").each((_i, el) => {
    const content = $(el).html() || "";
    if (content.includes("tailwind.config") || content.includes("tailwind")) {
      log("🗑️", "Removed inline Tailwind config script");
      $(el).remove();
    }
  });

  $("style").each((_i, el) => {
    const content = $(el).html() || "";
    if (content.trim()) {
      inlineStyles.push(content);
    }
    $(el).remove();
  });

  if (inlineStyles.length > 0) {
    log("📝", `Extracted ${inlineStyles.length} inline <style> block(s)`);
  }

  return inlineStyles;
}

// ─────────────────────────────────────────────
//  Step 4 — Compile Tailwind CSS
// ─────────────────────────────────────────────

async function compileTailwindCss(
  intermediateHtmlPath: string,
  inlineStyles: string[],
  assetsDir: string,
): Promise<string> {
  const inputCss = [
    "@tailwind base;",
    "@tailwind components;",
    "@tailwind utilities;",
    "",
    "/* ── Extracted inline styles ── */",
    ...inlineStyles,
  ].join("\n");

  const tailwindConfig = {
    content: [intermediateHtmlPath],
    theme: {
      extend: {
        colors: {
          primary: "#D4AF37",
          "background-light": "#1A3B2E",
          "background-dark": "#0F241C",
          "text-light": "#F5F5DC",
          "text-dark": "#EAEAEA",
          accent: "#B8860B",
        },
        fontFamily: {
          display: ["Playfair Display", "serif"],
          body: ["Lato", "sans-serif"],
        },
      },
    },
    corePlugins: {
      preflight: true,
    },
  };

  log("⚙️", "Compiling Tailwind CSS (this may take a moment)...");

  const result = await postcss([
    tailwindcss(tailwindConfig as Parameters<typeof tailwindcss>[0]),
    autoprefixer(),
    cssnano({ preset: "default" }),
  ]).process(inputCss, { from: undefined });

  const cssOutputPath = path.join(assetsDir, "styles.min.css");
  await fs.writeFile(cssOutputPath, result.css, "utf-8");

  const sizeKB = (Buffer.byteLength(result.css, "utf-8") / 1024).toFixed(1);
  log("✅", `Tailwind CSS compiled and minified → styles.min.css (${sizeKB} KB)`);

  return cssOutputPath;
}

// ─────────────────────────────────────────────
//  Step 5 — Extract Metadata from <head>
// ─────────────────────────────────────────────

function extractMetadata($: cheerio.CheerioAPI): LandingMeta {
  const title = $("head title").text().trim() || "";
  const description = $('head meta[name="description"]').attr("content")?.trim() || "";

  const og: Record<string, string> = {};
  $('head meta[property^="og:"]').each((_i, el) => {
    const property = $(el).attr("property");
    const content = $(el).attr("content");
    if (property && content) {
      og[property] = content.trim();
    }
  });

  log("📋", `Extracted metadata — title: "${title.slice(0, 50)}${title.length > 50 ? "..." : ""}"`);
  if (description) log("📋", `  description: "${description.slice(0, 60)}${description.length > 60 ? "..." : ""}"`);
  if (Object.keys(og).length > 0) log("📋", `  OG tags: ${Object.keys(og).join(", ")}`);

  return { title, description, og };
}

// ─────────────────────────────────────────────
//  Step 6 — Sanitize Body HTML with DOMPurify
// ─────────────────────────────────────────────

function sanitizeBodyHtml(bodyHtml: string): string {
  const window = new JSDOM("").window;
  const purify = DOMPurify(window as any);

  const sanitized = purify.sanitize(bodyHtml, {
    WHOLE_DOCUMENT: false, // Fragment mode — no <html>/<head>/<body> wrapping
    ADD_TAGS: ["link", "style"],
    ADD_ATTR: ["rel", "href", "media", "class", "id", "role", "aria-label", "aria-hidden", "loading", "decoding"],
    FORBID_TAGS: ["script", "iframe", "object", "embed", "form"],
    FORBID_ATTR: [
      "onclick", "ondblclick", "onmousedown", "onmouseup", "onmouseover",
      "onmousemove", "onmouseout", "onkeypress", "onkeydown", "onkeyup",
      "onload", "onerror", "onabort", "onblur", "onchange", "onfocus",
      "onreset", "onsubmit", "onselect",
    ],
  });

  log("🔒", "Body HTML sanitized — all <script> tags and inline event handlers removed");
  return sanitized;
}

// ─────────────────────────────────────────────
//  Main Pipeline
// ─────────────────────────────────────────────

export async function processLanding(config: ProcessorConfig): Promise<ProcessingResult> {
  const { inputHtmlPath, outputDir, webpQuality } = config;

  // Validate input
  const inputExists = await fs.access(inputHtmlPath).then(() => true).catch(() => false);
  if (!inputExists) {
    throw new Error(`Input file not found: ${inputHtmlPath}`);
  }

  // Read original HTML
  const rawHtml = await fs.readFile(inputHtmlPath, "utf-8");
  const originalSizeBytes = Buffer.byteLength(rawHtml, "utf-8");
  log("📄", `Loaded input: ${inputHtmlPath} (${(originalSizeBytes / 1024).toFixed(1)} KB)`);

  // Create output directories
  const assetsDir = path.join(outputDir, "assets");
  await fs.mkdir(assetsDir, { recursive: true });
  log("📁", `Output directory: ${outputDir}`);

  // Load HTML into cheerio
  const $ = cheerio.load(rawHtml);

  // ── Step 1: Extract base64 images ──
  const base64Count = await extractBase64Images($, assetsDir, webpQuality);

  // ── Step 2: Download external images ──
  const externalCount = await downloadExternalImages($, assetsDir, webpQuality);

  // ── Step 3: Remove Tailwind CDN scripts + extract inline styles ──
  const inlineStyles = removeTailwindCdnScripts($);

  // ── Step 4: Write intermediate HTML (for Tailwind content scanning) ──
  const intermediateHtmlPath = path.join(outputDir, "_intermediate.html");
  await fs.writeFile(intermediateHtmlPath, $.html(), "utf-8");

  // ── Step 5: Compile Tailwind CSS against the intermediate HTML ──
  const cssPath = await compileTailwindCss(intermediateHtmlPath, inlineStyles, assetsDir);

  // ── Step 6: Extract metadata from <head> → meta.json ──
  const metadata = extractMetadata($);
  const metaJsonPath = path.join(outputDir, "meta.json");
  await fs.writeFile(metaJsonPath, JSON.stringify(metadata, null, 2), "utf-8");
  log("📝", `Metadata written → meta.json`);

  // ── Step 7: Extract <body> inner HTML (THE DECAPITATION) ──
  const bodyInnerHtml = $("body").html() || "";

  // ── Step 8: Sanitize body HTML (without the CSS link yet) ──
  const sanitizedBody = sanitizeBodyHtml(bodyInnerHtml);

  // ── Step 8.5: Extract <link rel="stylesheet"> from <head> to preserve fonts ──
  const headLinks: string[] = [];
  $("head link[rel='stylesheet']").each((_i, el) => {
    headLinks.push($.html(el));
  });

  // ── Step 9: Inject CSS link and font links at the very top of the sanitized body ──
  const cssLink = '<link rel="stylesheet" href="./assets/styles.min.css">';
  const allLinks = [cssLink, ...headLinks].join("\n");
  const finalBodyHtml = `${allLinks}\n${sanitizedBody}`;

  // ── Step 10: Write body.html ──
  const bodyHtmlPath = path.join(outputDir, "body.html");
  await fs.writeFile(bodyHtmlPath, finalBodyHtml, "utf-8");

  // ── Step 10: Clean up — remove index.html if it exists from previous runs ──
  const legacyIndexPath = path.join(outputDir, "index.html");
  await fs.unlink(legacyIndexPath).catch(() => { /* ignore */ });
  await fs.unlink(intermediateHtmlPath).catch(() => { /* ignore */ });

  const finalBodySizeBytes = Buffer.byteLength(finalBodyHtml, "utf-8");

  log("", "─────────────────────────────────────");
  log("🎉", "Processing complete!");
  log("📊", `Original: ${(originalSizeBytes / 1024).toFixed(1)} KB → Body: ${(finalBodySizeBytes / 1024).toFixed(1)} KB`);
  log("🖼️", `Images: ${base64Count} base64 + ${externalCount} external = ${base64Count + externalCount} total`);
  log("📄", `Body: ${bodyHtmlPath}`);
  log("📋", `Meta: ${metaJsonPath}`);
  log("🎨", `CSS: ${cssPath}`);
  log("", "─────────────────────────────────────");

  return {
    outputBodyPath: bodyHtmlPath,
    outputMetaPath: metaJsonPath,
    outputCssPath: cssPath,
    totalImagesProcessed: base64Count + externalCount,
    base64ImagesConverted: base64Count,
    externalImagesDownloaded: externalCount,
    originalSizeBytes,
    finalBodySizeBytes,
  };
}
