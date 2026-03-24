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
  localImagesProcessed: number;
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
//  Step 2.5 — Local Image Processing
// ─────────────────────────────────────────────

async function processLocalImages(
  $: cheerio.CheerioAPI,
  assetsDir: string,
  quality: number,
): Promise<number> {
  const localImgs = $("img").filter((_i, el) => {
    const src = $(el).attr("src") || "";
    return src.startsWith("/");
  });

  const PUBLIC_DIR = path.resolve(process.cwd(), "../../apps/_template/public");
  let count = 0;

  for (let i = 0; i < localImgs.length; i++) {
    const el = localImgs[i];
    if (!el) continue;

    const src = $(el).attr("src");
    if (!src) continue;

    try {
      const sourcePath = path.join(PUBLIC_DIR, src);
      const exists = await fs.access(sourcePath).then(() => true).catch(() => false);
      
      if (!exists) {
        log("⚠️", `Local asset not found: ${sourcePath} — skipping optimization`);
        continue;
      }

      const buffer = await fs.readFile(sourcePath);
      const originalExt = path.extname(src).replace(".", "");
      const baseName = path.basename(src, path.extname(src));
      const filename = `${baseName}-${originalExt}.webp`;
      const outputPath = path.join(assetsDir, filename);

      log("🖼️  (Local)", `Optimizing: ${src} → ${filename}`);

      await sharp(buffer)
        .webp({ quality })
        .toFile(outputPath);

      $(el).attr("src", `./assets/${filename}`);
      count++;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      log("❌", `Failed to process local image ${src}: ${message}`);
    }
  }

  return count;
}

// ─────────────────────────────────────────────
//  Step 3 — Extract Tailwind Config + Remove CDN Scripts
// ─────────────────────────────────────────────

interface ExtractedTailwindConfig {
  colors: Record<string, string>;
  fontFamily: Record<string, string[]>;
  borderRadius: Record<string, string>;
  backgroundImage: Record<string, string>;
}

/**
 * Parses the inline `tailwind.config = { ... }` script tag and extracts
 * theme.extend values (colors, fontFamily, etc.) so we can compile
 * CSS with the EXACT same design tokens as the original HTML.
 */
function extractTailwindConfig($: cheerio.CheerioAPI): ExtractedTailwindConfig {
  const defaults: ExtractedTailwindConfig = {
    colors: {},
    fontFamily: {},
    borderRadius: {},
    backgroundImage: {},
  };

  let configScript = "";
  $("script").each((_i, el) => {
    const content = $(el).html() || "";
    if (content.includes("tailwind.config")) {
      configScript = content;
    }
  });

  if (!configScript) {
    log("⚠️", "No inline tailwind.config found — using empty defaults");
    return defaults;
  }

  try {
    // Extract the config object using a safe sandbox
    // We wrap it so `tailwind.config = { ... }` becomes an assignable expression
    const sandbox = { tailwind: { config: {} as Record<string, unknown> } };
    const fn = new Function("tailwind", configScript);
    fn(sandbox.tailwind);

    const theme = (sandbox.tailwind.config as Record<string, unknown>).theme as Record<string, unknown> | undefined;
    const extend = theme?.extend as Record<string, unknown> | undefined;

    if (extend?.colors) {
      defaults.colors = extend.colors as Record<string, string>;
    }
    if (extend?.fontFamily) {
      defaults.fontFamily = extend.fontFamily as Record<string, string[]>;
    }
    if (extend?.borderRadius) {
      defaults.borderRadius = extend.borderRadius as Record<string, string>;
    }
    if (extend?.backgroundImage) {
      defaults.backgroundImage = extend.backgroundImage as Record<string, string>;
    }

    const colorCount = Object.keys(defaults.colors).length;
    const fontCount = Object.keys(defaults.fontFamily).length;
    log("🎨", `Extracted Tailwind config — ${colorCount} colors, ${fontCount} font families`);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    log("⚠️", `Failed to parse inline tailwind.config: ${message} — using empty defaults`);
  }

  return defaults;
}

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
  extractedConfig: ExtractedTailwindConfig,
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
          ...extractedConfig.colors,
          // Legacy Hardcoded Defaults (for storefronts)
          "cs-primary": "#047857",
          "cs-secondary": "#10b981",
          "cs-dark": "#022c22",
          // Add standard colors that might be used as strings
          emerald: {
            50: "#ecfdf5",
            100: "#d1fae5",
            200: "#a7f3d0",
            300: "#6ee7b7",
            400: "#34d399",
            500: "#10b981",
            600: "#059669",
            700: "#047857",
            800: "#065f46",
            900: "#064e3b",
            950: "#022c22",
          },
        },
        fontFamily: {
          ...extractedConfig.fontFamily,
          sans: ["Inter", "system-ui", "sans-serif"],
          display: ["Outfit", "Inter", "sans-serif"],
        },
        ...(Object.keys(extractedConfig.borderRadius).length > 0 && {
          borderRadius: extractedConfig.borderRadius,
        }),
        ...(Object.keys(extractedConfig.backgroundImage).length > 0 && {
          backgroundImage: extractedConfig.backgroundImage,
        }),
      },
    },
    corePlugins: {
      preflight: true,
    },
  };

  log("⚙️", "Compiling Tailwind CSS (this may take a moment)...");
  log("🎨", `Using colors: ${JSON.stringify(extractedConfig.colors)}`);

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

  // ── Step 2.5: Process local images ──
  const localCount = await processLocalImages($, assetsDir, webpQuality);

  // ── Step 3a: Extract Tailwind config from inline script (BEFORE removing it) ──
  const extractedConfig = extractTailwindConfig($);

  // ── Step 3b: Remove Tailwind CDN scripts + extract inline styles ──
  const inlineStyles = removeTailwindCdnScripts($);

  // ── Step 4: Write intermediate HTML (for Tailwind content scanning) ──
  const intermediateHtmlPath = path.join(outputDir, "_intermediate.html");
  await fs.writeFile(intermediateHtmlPath, $.html(), "utf-8");

  // ── Step 5: Compile Tailwind CSS against the intermediate HTML ──
  const cssPath = await compileTailwindCss(intermediateHtmlPath, inlineStyles, assetsDir, extractedConfig);

  // ── Step 6: Extract metadata from <head> → meta.json ──
  const metadata = extractMetadata($);
  const metaJsonPath = path.join(outputDir, "meta.json");
  await fs.writeFile(metaJsonPath, JSON.stringify(metadata, null, 2), "utf-8");
  log("📝", `Metadata written → meta.json`);

  // ── Step 7: Extract <body> inner HTML (THE DECAPITATION) ──
  // First, remove <nav> and <footer> tags to rely on the app's native components
  $("nav").remove();
  $("footer").remove();
  log("🗑️", "Removed <nav> and <footer> tags from HTML");

  // CRITICAL: Capture the body's own classes (e.g., bg-background-light, text-text-light)
  // and transfer them to a wrapper <div> so the design is preserved after decapitation.
  const bodyClasses = $("body").attr("class") || "";
  const bodyInnerHtml = $("body").html() || "";
  log("🔪", `Body classes captured: "${bodyClasses}"`);

  // ── Step 8: Sanitize body HTML (without the CSS link yet) ──
  const sanitizedBody = sanitizeBodyHtml(bodyInnerHtml);

  // ── Step 8.5: Extract <link rel="stylesheet"> from <head> to preserve fonts ──
  const headLinks: string[] = [];
  $("head link[rel='stylesheet']").each((_i, el) => {
    headLinks.push($.html(el));
  });

  // ── Step 9: Inject CSS link, font links, and body-class wrapper ──
  const cssLink = '<link rel="stylesheet" href="./assets/styles.min.css">';
  const allLinks = [cssLink, ...headLinks].join("\n");
  // Wrap in a <div> that inherits the original <body> classes
  const bodyWrapper = bodyClasses
    ? `<div class="${bodyClasses}">\n${sanitizedBody}\n</div>`
    : sanitizedBody;
  const finalBodyHtml = `${allLinks}\n${bodyWrapper}`;

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
  log("🖼️", `Images: ${base64Count} base64 + ${externalCount} external + ${localCount} local = ${base64Count + externalCount + localCount} total`);
  log("📄", `Body: ${bodyHtmlPath}`);
  log("📋", `Meta: ${metaJsonPath}`);
  log("🎨", `CSS: ${cssPath}`);
  log("", "─────────────────────────────────────");

  return {
    outputBodyPath: bodyHtmlPath,
    outputMetaPath: metaJsonPath,
    outputCssPath: cssPath,
    totalImagesProcessed: base64Count + externalCount + localCount,
    base64ImagesConverted: base64Count,
    externalImagesDownloaded: externalCount,
    localImagesProcessed: localCount,
    originalSizeBytes,
    finalBodySizeBytes,
  };
}
