import * as path from "node:path";
import * as fs from "node:fs/promises";
import { processLanding } from "./landing-processor";

// ─────────────────────────────────────────────
//  CLI Entry Point — Landing Page Processor
//  Usage: npx tsx src/cli.ts <input.html> --tenant <slug> --landing <slug> [-q quality]
// ─────────────────────────────────────────────

const WORKSPACE_ROOT = ".local-landings";

function printHelp(): void {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║            🚀 Landing Page Processor CLI                 ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  Usage:                                                  ║
║    npx tsx src/cli.ts <input.html> [options]              ║
║                                                          ║
║  Required:                                               ║
║    <input.html>      Path to the raw HTML file           ║
║    --tenant, -t      Tenant slug (e.g. bocata-artesanal) ║
║    --landing, -l     Landing slug (e.g. home, promo-2025)║
║                                                          ║
║  Optional:                                               ║
║    --quality, -q     WebP quality 1-100 (default: 80)    ║
║                                                          ║
║  Output:                                                 ║
║    .local-landings/<tenant>/<landing>/index.html          ║
║    .local-landings/<tenant>/<landing>/assets/             ║
║                                                          ║
║  Example:                                                ║
║    npx tsx src/cli.ts ~/landing.html -t my-cafe -l home   ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
`);
}

function parseArg(args: string[], flags: string[]): string | undefined {
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg && flags.includes(arg)) {
      return args[i + 1];
    }
  }
  return undefined;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
    printHelp();
    process.exit(0);
  }

  // First positional arg = input path
  const inputPath = args[0];
  if (!inputPath || inputPath.startsWith("-")) {
    console.error("❌ Error: Input HTML path is required as first argument.");
    printHelp();
    process.exit(1);
  }

  // Required flags
  const tenantSlug = parseArg(args, ["--tenant", "-t"]);
  const landingSlug = parseArg(args, ["--landing", "-l"]);

  if (!tenantSlug) {
    console.error("❌ Error: --tenant (-t) is required.");
    process.exit(1);
  }
  if (!landingSlug) {
    console.error("❌ Error: --landing (-l) is required.");
    process.exit(1);
  }

  // Optional quality
  let quality = 80;
  const qualityStr = parseArg(args, ["--quality", "-q"]);
  if (qualityStr) {
    const parsed = parseInt(qualityStr, 10);
    if (isNaN(parsed) || parsed < 1 || parsed > 100) {
      console.error("❌ Error: Quality must be a number between 1 and 100.");
      process.exit(1);
    }
    quality = parsed;
  }

  // Build rigid output path: .local-landings/<tenant>/<landing>/
  const outputDir = path.resolve(WORKSPACE_ROOT, tenantSlug, landingSlug);
  const resolvedInputPath = path.resolve(inputPath);

  // If destination exists, wipe it completely for a clean overwrite
  const exists = await fs.access(outputDir).then(() => true).catch(() => false);
  if (exists) {
    await fs.rm(outputDir, { recursive: true, force: true });
    console.log(`🗑️  Cleared existing workspace: ${outputDir}`);
  }

  console.log("");
  console.log("🚀 Landing Page Processor");
  console.log("─────────────────────────────────────");
  console.log(`📥 Input:   ${resolvedInputPath}`);
  console.log(`🏢 Tenant:  ${tenantSlug}`);
  console.log(`📄 Landing: ${landingSlug}`);
  console.log(`📤 Output:  ${outputDir}`);
  console.log(`🎨 Quality: ${quality}`);
  console.log("─────────────────────────────────────");
  console.log("");

  try {
    const result = await processLanding({
      inputHtmlPath: resolvedInputPath,
      outputDir,
      webpQuality: quality,
    });

    const reduction = ((1 - result.finalBodySizeBytes / result.originalSizeBytes) * 100).toFixed(1);
    console.log("");
    console.log(`📉 Size reduction: ${reduction}%`);
    console.log(`\n✅ Ready to preview: open ${path.join(outputDir, "body.html")} in your browser`);
    console.log(`✅ Ready to upload:  npx tsx src/cli-upload.ts -t ${tenantSlug} -l ${landingSlug}\n`);
    process.exit(0);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`\n❌ Fatal error: ${message}\n`);
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();
