import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as url from 'node:url';

// ─────────────────────────────────────────────
//  Next.js Mocks
// ─────────────────────────────────────────────

/** 
 * Mock for next/image. 
 * Per tech lead instructions: must return standard <img> with loading="lazy" and decoding="async".
 */
const NextImageMock = ({ src, alt, className }: any) => {
  return (
    <img 
      src={src} 
      alt={alt || ''} 
      className={className} 
      loading="lazy" 
      decoding="async" 
    />
  );
};

/** Mock for next/link. Returns a plain <a> tag. */
const NextLinkMock = ({ href, children, className, ...props }: any) => {
  return (
    <a href={href} className={className} {...props}>
      {children}
    </a>
  );
};

/** Mock for next/font/google. Returns a function that returns a dummy class object. */
const NextFontGoogleMock = () => {
    return () => ({
        className: 'next-font-mock',
        style: {}
    });
};

// Apply mocks globally to the process so that imported components use them.
// Note: This is a bit hacky for a script, but effective for static rendering.
// Alternative: use a bundler or specialized transform.
(global as any).React = React;
(global as any).NextImage = NextImageMock;
(global as any).NextLink = NextLinkMock;

// Mock next/font/google for various common fonts
(global as any).Poppins = NextFontGoogleMock();
(global as any).Inter = NextFontGoogleMock();
(global as any).Outfit = NextFontGoogleMock();
(global as any).Geist = NextFontGoogleMock();
(global as any).GeistMono = NextFontGoogleMock();

// Mock useToast from @alvarosky/ui or similar
(global as any).useToast = () => ({
    toast: () => {},
    dismiss: () => {},
});

(global as any).useTenant = () => ({
    tenantId: '6786a344714f3ead406981ee', // Dummy ID for rendering
    slug: (global as any).currentTenantSlug ?? 'cocinasiete',
});

// We also need to mock lucide-react if the components use it and it's not installed in this package,
// but since landing-builder sits in the monorepo, it might resolve correctly if we use tsx.

// ─────────────────────────────────────────────
//  Registry of Legacy Storefronts
// ─────────────────────────────────────────────

/** 
 * We dynamically import the components to avoid top-level resolution issues 
 * before mocks are applied.
 */
const STOREFRONT_MAP: Record<string, string> = {
  'cocinasiete': '../../../apps/_template/src/components/storefronts/cocinasiete/Landing.tsx',
  'soydeborasoysaludable': '../../../apps/_template/src/components/storefronts/deborahmoscoso/Landing.tsx',
  'mauromera': '../../../apps/_template/src/components/storefronts/mauromera/Landing.tsx',
};

// ─────────────────────────────────────────────
//  Renderer Logic
// ─────────────────────────────────────────────

export async function renderLegacyLanding(tenantSlug: string): Promise<string> {
  const componentPath = STOREFRONT_MAP[tenantSlug];
  if (!componentPath) {
    throw new Error(`No legacy component found for tenant: ${tenantSlug}`);
  }

  (global as any).currentTenantSlug = tenantSlug;

  // Use dynamic import to bring in the component
  const absolutePath = path.resolve(__dirname, componentPath);
  const fileUrl = url.pathToFileURL(absolutePath).href;
  const { default: LandingComponent } = await import(fileUrl);

  // Default mock data (can be refined if components strictly require specific fields)
  const mockData = {
    tenantId: tenantSlug,
    branding: {
      primaryColor: '#10b981', // emerald-500 default
      secondaryColor: '#064e3b',
    },
    features: [],
  };

  // Import mocks for wrapping
  const { ToastProvider: ToastMockProvider } = await import('./mocks/ui-toast');
  const { TenantProvider: TenantMockProvider } = await import('./mocks/app-providers');

  // Perform the actual rendering
  console.log(`🎨 Rendering legacy component for: [${tenantSlug}]`);
  
  const content = ReactDOMServer.renderToStaticMarkup(
    <TenantMockProvider>
        <ToastMockProvider>
            <LandingComponent data={mockData} />
        </ToastMockProvider>
    </TenantMockProvider>
  );

  // Wrap in a minimal HTML shell for the processor
  // The shell includes the required meta tags and structure for Tailwind scanning
  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Landing - ${tenantSlug}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
    <div id="root">${content}</div>
</body>
</html>
  `.trim();

  return html;
}

// ─────────────────────────────────────────────
//  CLI Hook (Optional usage via npx tsx src/static-renderer.tsx cocinasiete)
// ─────────────────────────────────────────────

if (require.main === module) {
  const tenant = process.argv[2];
  if (!tenant) {
    console.error('Usage: npx tsx src/static-renderer.tsx <tenant-slug>');
    process.exit(1);
  }

  renderLegacyLanding(tenant).then(async (html) => {
    const outputDir = path.resolve(process.cwd(), 'inputs', tenant);
    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(path.join(outputDir, 'raw.html'), html);
    console.log(`✅ Rendered HTML saved to: ${path.join(outputDir, 'raw.html')}`);
  }).catch(err => {
    console.error('❌ Rendering failed:', err);
    process.exit(1);
  });
}
