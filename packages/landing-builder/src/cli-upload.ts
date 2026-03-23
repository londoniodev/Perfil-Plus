import * as path from "node:path";
import { config as dotenvConfig } from "dotenv";
import { uploadLanding } from "./uploader";

// ─────────────────────────────────────────────
//  CLI Entry Point — S3/MinIO Uploader
//  Usage: npx tsx src/cli-upload.ts --tenant <slug> --landing <slug>
// ─────────────────────────────────────────────

// Load .env from the landing-builder package root (one level up from src/)
// This is the PRIMARY config — use for production MinIO credentials
dotenvConfig({ path: path.resolve(__dirname, "../.env") });
// Also load .env from monorepo root (three levels up from packages/landing-builder/src)
dotenvConfig({ path: path.resolve(__dirname, "../../../.env") });
// Also try from CWD in case script is run from monorepo root
dotenvConfig({ path: path.resolve(process.cwd(), ".env") });

function printHelp(): void {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║            ⬆️  Landing Page Uploader CLI                 ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  Usage:                                                  ║
║    npx tsx src/cli-upload.ts [options]                    ║
║                                                          ║
║  Required:                                               ║
║    --tenant, -t      Tenant slug (e.g. bocata-artesanal) ║
║    --landing, -l     Landing slug (e.g. home, promo-2025)║
║                                                          ║
║  Environment Variables (required):                       ║
║    S3_ENDPOINT       MinIO endpoint URL                  ║
║    S3_REGION         S3 region (e.g. us-east-1)          ║
║    S3_ACCESS_KEY     MinIO access key                    ║
║    S3_SECRET_KEY     MinIO secret key                    ║
║    S3_PUBLIC_URL     Public CDN base URL                 ║
║                                                          ║
║  Source:                                                 ║
║    Reads from .local-landings/<tenant>/<landing>/         ║
║    (Run the processor first if this doesn't exist)       ║
║                                                          ║
║  Uploads to:                                             ║
║    Bucket: <tenant>-public                               ║
║    Key:    landings/<landing>/index.html                  ║
║    Assets: landings/<landing>/assets/*                    ║
║                                                          ║
║  Example:                                                ║
║    npx tsx src/cli-upload.ts -t bocata-artesanal -l home  ║
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

  console.log("");
  console.log("⬆️  Landing Page Uploader");
  console.log("─────────────────────────────────────");
  console.log(`🏢 Tenant:  ${tenantSlug}`);
  console.log(`📄 Landing: ${landingSlug}`);
  console.log("─────────────────────────────────────");
  console.log("");

  try {
    const result = await uploadLanding({ tenantSlug, landingSlug });

    console.log("");
    console.log(`🌐 Landing live at: ${result.publicUrl}`);
    console.log("");
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
