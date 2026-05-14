import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as url from 'node:url';

// ─────────────────────────────────────────────
//  Next.js Mocks
// ─────────────────────────────────────────────

const NextImageMock = ({ src, alt, className }: any) => (
  <img src={src} alt={alt || ''} className={className} loading="lazy" decoding="async" />
);

const NextLinkMock = ({ href, children, className, ...props }: any) => (
  <a href={href} className={className} {...props}>{children}</a>
);

const NextFontGoogleMock = () => () => ({ className: 'next-font-mock', style: {} });

(global as any).React = React;
(global as any).NextImage = NextImageMock;
(global as any).NextLink = NextLinkMock;
(global as any).Inter = NextFontGoogleMock();
(global as any).Outfit = NextFontGoogleMock();

(global as any).useToast = () => ({ toast: () => {}, dismiss: () => {} });
(global as any).useTenant = () => ({
    tenantId: '6786a344714f3ead406981ee', 
    slug: (global as any).currentTenantSlug ?? 'cocinasiete',
    contactPhone: '573000000000'
});

// ─────────────────────────────────────────────
//  Registry of Legacy Storefronts (Multi-Page)
// ─────────────────────────────────────────────

const STOREFRONT_MAP: Record<string, Record<string, string>> = {
  'alvarolondono': {
    'home': '../../../apps/_template/src/components/storefronts/alvarolondono/Landing'
  },
  'cocinasiete': {
    'home': '../../../apps/_template/src/components/storefronts/alvarolondono/Landing' // Temporary fallback for test
  },
};

// ─────────────────────────────────────────────
//  Renderer Logic
// ─────────────────────────────────────────────

export async function renderLegacyLanding(tenantSlug: string, pageSlug: string = 'home'): Promise<string> {
  const tenantPages = STOREFRONT_MAP[tenantSlug];
  if (!tenantPages) throw new Error(`No tenant found: ${tenantSlug}`);

  const componentPath = tenantPages[pageSlug];
  if (!componentPath) throw new Error(`No component for ${tenantSlug}/${pageSlug}`);

  (global as any).currentTenantSlug = tenantSlug;

  const absolutePath = path.resolve(__dirname, componentPath);
  const fileUrl = url.pathToFileURL(absolutePath).href;
  const module = await import(fileUrl);
  
  // Try common export names in legacy code
  const Component = module.Landing || module.LogrosContent || module.ServicesSelector || module.PortafolioContent || module.AboutContent || module.EmprendeContent || module.default;
  if (!Component) throw new Error(`Valid component not found in ${componentPath}`);

  const { ToastProvider: ToastMockProvider } = await import('./mocks/ui-toast');
  const { TenantProvider: TenantMockProvider } = await import('./mocks/app-providers');

  console.log(`🎨 Rendering: [${tenantSlug}/${pageSlug}]`);
  
  const content = ReactDOMServer.renderToStaticMarkup(
    <TenantMockProvider>
        <ToastMockProvider>
            <Component />
        </ToastMockProvider>
    </TenantMockProvider>
  );

  return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>${tenantSlug} - ${pageSlug}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body class="bg-background text-foreground">
    <div id="root">${content}</div>
</body>
</html>
  `.trim();
}

// ─────────────────────────────────────────────
//  CLI Hook
// ─────────────────────────────────────────────

if (require.main === module) {
  const tenant = process.argv[2];
  const page = process.argv[3] || 'home';

  if (!tenant) {
    console.error('Usage: npx tsx src/static-renderer.tsx <tenant-slug> [page-slug|all]');
    process.exit(1);
  }

  const run = async (t: string, p: string) => {
    const html = await renderLegacyLanding(t, p);
    const outputDir = path.resolve(process.cwd(), 'inputs', t, p);
    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(path.join(outputDir, 'raw.html'), html);
    console.log(`✅ Saved: ${path.join(outputDir, 'raw.html')}`);
  };

  if (page === 'all') {
    const pages = Object.keys(STOREFRONT_MAP[tenant] || {});
    (async () => {
        for (const p of pages) await run(tenant, p);
    })();
  } else {
    run(tenant, page).catch(err => {
      console.error('❌ Failed:', err);
      process.exit(1);
    });
  }
}
