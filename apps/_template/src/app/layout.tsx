import type { Metadata, Viewport } from "next";
import "@alvarosky/ui/globals.css";
import { NavigationWrapper } from "@/components/layout/NavigationWrapper";
import { Footer } from "@/components/layout/Footer";
import { GlobalSchemas } from "@/components/seo/JsonLd";
import { ToastProvider, getFontVariables } from "@alvarosky/ui";
import dynamic from "next/dynamic";
import { ThemeProvider, TenantProvider } from "./providers";
import { BrandProvider } from "@alvarosky/ui";
import { siteConfig } from "@/config/site";
import { serverFetch } from "@/lib/api-server";
import { getTenantId } from "@/lib/config-server";
import { headers } from "next/headers";

const PwaInstallPrompt = dynamic(
  () => import("@alvarosky/ui/pwa-install-prompt").then((mod) => mod.PwaInstallPrompt)
);

const TableDetector = dynamic(
  () => import("@/components/shop/table-detector").then((mod) => mod.TableDetector)
);

async function getTenantDesign(tenantId: string) {
  // Skip DB call during build time (static generation) — API is not accessible in Docker build context easily
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return null;
  }
  try {
    // IMPORTANTE: Usamos fetch nativo en lugar de serverFetch porque:
    // 1. El endpoint /tenant/branding es @Public() y NO requiere JWT/cookies
    // 2. serverFetch llama a cookies() que marca el fetch como dinámico,
    //    impidiendo el cache ISR y causando errores en páginas estáticas
    // Use INTERNAL_API_URL inside Docker for SSR to avoid external routing hops and HTTPS 404s
    const _apiUrl = (process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://api:3001/api').replace(/\/+$/, "");
    const API_URL = _apiUrl.endsWith('/api') ? _apiUrl : `${_apiUrl}/api`;
    const finalEndpoint = `${API_URL}/tenant/branding`;

    console.log(`[SSR BRANDING DEBUG] Fetching tenant ${tenantId} from: ${finalEndpoint}`);

    const response = await fetch(finalEndpoint, {
      cache: 'force-cache',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': tenantId,
        'x-internal-token': process.env.INTERNAL_API_KEY || 'default_dev_secret_key',
      },
      next: {
        tags: ['tenant-branding', `tenant-branding-${tenantId}`, `tenant-${tenantId}-branding`],
      }
    });

    if (!response.ok) {
      console.error(`Branding API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();

    // La API devuelve { name: '...', design: { primary, mode, radius, ... }, logo: "https://s3..." }
    // Fusionamos design + logo + links para que el layout pueda acceder a todo
    const design = data?.design ?? {
      colors: { primary: "#000000" },
      fonts: { heading: "Inter", body: "Inter" },
      radius: 0.5
    };

    return {
      name: data?.name || null,
      tagline: data?.tagline || null,
      ...design,
      logo: data?.logo || null,
      headerLinks: data?.headerLinks || null,
      footerLinks: data?.footerLinks || null
    };
  } catch (e) {
    console.warn("⚠️ API de Branding inalcanzable. Usando UI de contingencia:", e);
    return {
      name: null,
      tagline: null,
      colors: { primary: "#000000" },
      fonts: { heading: "Inter", body: "Inter" },
      radius: 0.5
    };
  }
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const baseMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | Psicología, cultura y decisiones conscientes`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: "Mauricio Mera", url: siteConfig.url }],
  creator: "Mauricio Mera",
  publisher: siteConfig.name,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} | Psicología, cultura y decisiones conscientes`,
    description: siteConfig.description,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} - Psicólogo y Consultor Organizacional`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} | Psicología, cultura y decisiones conscientes`,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: "@mauromera",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  verification: {
    // Agregar cuando estén disponibles:
    // google: 'google-site-verification-code',
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const tenantId = await getTenantId();
  const design = await getTenantDesign(tenantId);
  const logoUrl = design?.logo || '/images/branding/icon.png';
  const siteName = design?.name || siteConfig.name;
  const tagline = design?.tagline || siteConfig.description;

  return {
    ...baseMetadata,
    title: {
      default: `${siteName} | ${tagline}`,
      template: `%s | ${siteName}`,
    },
    description: tagline,
    icons: {
      icon: logoUrl,
      apple: logoUrl,
    },
    openGraph: {
      ...baseMetadata.openGraph,
      title: `${siteName} | ${tagline}`,
      description: tagline,
      siteName: siteName,
      images: [
        {
          url: logoUrl,
          width: 800,
          height: 800,
          alt: "Logo",
        },
      ],
    }
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // App-like feel, no zoom
  themeColor: "#09090b", // Dark theme match
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const tenantId = await getTenantId();
  const design = await getTenantDesign(tenantId);
  // Color fallback
  const primaryColor = design?.primary || "zinc";
  const logoUrl = design?.logo || '/images/branding/icon.png';
  const headerLinks = design?.headerLinks || null;
  const footerLinks = design?.footerLinks || null;

  const headersList = await headers();
  const tenantFeaturesRaw = headersList.get('x-tenant-features');
  const tenantSlugRaw = headersList.get('x-tenant-slug') || tenantId; // Fallback to tenantId if no slug
  console.log(`[LAYOUT DEBUG] tenantId=${tenantId}, slug=${tenantSlugRaw}, x-tenant-features raw="${tenantFeaturesRaw}"`);

  let hasDashboardFeature = true; // Default fallback publico
  let featureArray: string[] = [];

  if (tenantFeaturesRaw) {
    try {
      featureArray = JSON.parse(tenantFeaturesRaw);
      // Mostrar navegación completa si el tenant tiene cualquier módulo activo
      hasDashboardFeature = featureArray.includes('dashboard') || featureArray.length > 0;
      console.log(`[LAYOUT DEBUG] Parsed features: ${JSON.stringify(featureArray)}, hasDashboardFeature=${hasDashboardFeature}`);
    } catch (e) {
      console.warn("Failed to parse tenant features block");
    }
  } else {
    console.log(`[LAYOUT DEBUG] No x-tenant-features header found, defaulting hasDashboardFeature=true`);
  }

  const isMauroMera = tenantSlugRaw === "mauromera";

  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${getFontVariables()} font-sans antialiased`}>
        <TenantProvider
          tenantId={tenantId}
          features={featureArray}
          headerLinks={headerLinks}
          footerLinks={footerLinks}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme={isMauroMera ? "dark" : "light"}
            enableSystem={!isMauroMera}
            forcedTheme={isMauroMera ? "dark" : undefined}
          >
            <BrandProvider settings={{ ...design, primary: primaryColor } as any}>
              <GlobalSchemas />
              <ToastProvider>
                <NavigationWrapper footer={<Footer logo={logoUrl} footerLinks={footerLinks} />} hasDashboardFeature={hasDashboardFeature} logo={logoUrl}>
                  {children}
                </NavigationWrapper>
                <PwaInstallPrompt />
                <TableDetector />
              </ToastProvider>
            </BrandProvider>
          </ThemeProvider>
        </TenantProvider>
      </body>
    </html>
  );
}


