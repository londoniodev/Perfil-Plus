# Landing Builder

CLI tool to process, optimize, and upload static HTML landing pages for the Perfil Plus platform.

## Architecture

```
raw.html (Tailwind CDN)
    │
    ▼ cli.ts — Process
    │
    ├── Extract base64 images → WebP
    ├── Download external images → WebP
    ├── Process local images → WebP
    ├── Extract Tailwind config from inline script
    ├── Remove Tailwind CDN scripts
    ├── Compile Tailwind CSS → styles.min.css
    ├── Extract <head> metadata → meta.json
    ├── Remove <nav> and <footer> (app provides these)
    ├── Sanitize body HTML (DOMPurify)
    └── Output: body.html + assets/ + meta.json
    │
    ▼ cli-upload.ts — Upload
    │
    ├── Mutate asset paths → S3 CDN URLs
    ├── Upload body.html + meta.json + assets/ to S3
    ├── Sync menu item in database
    └── Fire revalidation webhook
```

## Usage

### 1. Create a raw HTML file

Place your landing page HTML in the `inputs/` directory:

```
inputs/
└── <tenant-slug>/
    └── <landing-slug>/
        └── raw.html
```

The HTML should use Tailwind CDN (`<script src="https://cdn.tailwindcss.com">`) for styling. Include a `tailwind.config` inline script for custom colors/fonts.

### 2. Process the landing

```bash
npx tsx src/cli.ts inputs/<tenant>/<landing>/raw.html -t <tenant> -l <landing> [-q quality]
```

**Options:**
- `--tenant, -t` — Tenant slug (required)
- `--landing, -l` — Landing slug (required)
- `--quality, -q` — WebP quality 1-100 (default: 80)

**Output:** `.local-landings/<tenant>/<landing>/` with:
- `body.html` — Sanitized body (no `<html>`, `<head>`, `<nav>`, `<footer>`)
- `meta.json` — Extracted title, description, OG tags
- `assets/` — Optimized images (WebP) + compiled CSS

### 3. Upload to S3

```bash
npx tsx src/cli-upload.ts -t <tenant> -l <landing> [-d domain] [-b "Menu Label"]
```

**Options:**
- `--tenant, -t` — Tenant slug (required)
- `--landing, -l` — Landing slug (required)
- `--domain, -d` — Target domain for cache revalidation
- `--label, -b` — Menu label for database sync

**Requires `.env`:**
```env
S3_ENDPOINT=...
S3_PUBLIC_URL=...
S3_ACCESS_KEY=...
S3_SECRET_KEY=...
DATABASE_URL=...          # Optional: for menu sync
REVALIDATION_SECRET=...   # Optional: for cache purging
```

### 4. Legacy: Static Renderer (React → HTML)

For converting legacy React storefront components to raw HTML:

```bash
npx tsx src/static-renderer.tsx <tenant-slug> [page-slug|all]
```

## Directory Structure

```
packages/landing-builder/
├── src/
│   ├── cli.ts                  # Process CLI entry point
│   ├── cli-upload.ts           # Upload CLI entry point
│   ├── landing-processor.ts    # Core processing pipeline
│   ├── uploader.ts             # S3 upload + DB sync + revalidation
│   ├── static-renderer.tsx     # Legacy React-to-HTML renderer
│   └── mocks/                  # Next.js mocks for static rendering
├── inputs/                     # Raw HTML inputs (gitignored)
│   └── <tenant>/
│       └── <landing>/
│           └── raw.html
├── .local-landings/            # Processed output (gitignored)
├── package.json
├── tsconfig.json
└── README.md
```
