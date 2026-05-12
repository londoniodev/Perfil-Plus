import type { Metadata, Viewport } from "next";
import "@alvarosky/ui/globals.css";
import { GlobalSchemas } from "@/components/seo/JsonLd";
import { ToastProvider, getFontVariables } from "@alvarosky/ui";
import { getTenantFont } from "@/lib/fonts";
import dynamic from "next/dynamic";
import { AppProviders } from "./providers";
import { getTenantId } from "@/lib/config-server";
import { getTenantDesign } from "@/lib/tenant-server";
import { baseMetadata } from "@/config/metadata";
import { siteConfig } from "@/config/site";
import { headers } from "next/headers";
import { hexToHsl, getContrastForegroundHsl, getReadablePrimaryHsl } from "@alvarosky/shared";

const PwaInstallPrompt = dynamic(
  () => import("@alvarosky/ui/pwa-install-prompt").then((mod) => mod.PwaInstallPrompt)
);

const TableDetector = dynamic(
  () => import("@/components/shop/table-detector").then((mod) => mod.TableDetector)
);

const TikTokPixel = dynamic(
  () => import("@/components/tracking/tiktok-pixel").then((mod) => mod.TikTokPixel)
);



export async function generateMetadata(): Promise<Metadata> {
  const tenantId = await getTenantId();
  const design = await getTenantDesign(tenantId);
  const logoUrl = design?.brandSettings?.logoUrl || design?.brandSettings?.faviconUrl || design?.logo || '/images/branding/icon.png';
  const siteName = design?.name || siteConfig.name;
  const brand = design?.brandSettings;
  
  // SEO Autónomo: Prioridad a los campos personalizados del tenant
  const seoTitle = brand?.metaTitle || `${siteName} | ${brand?.tagline || design?.tagline || siteConfig.description}`;
  const seoDescription = brand?.metaDescription || brand?.tagline || design?.tagline || siteConfig.description;

  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") || headersList.get("host") || "localhost";
  const isLocal = host.includes("localhost") || host.includes("127.0.0.1") || host.includes(":");
  const protocol = isLocal ? "http" : "https";
  const currentUrl = `${protocol}://${host}`;

  const faviconUrl = design?.brandSettings?.faviconUrl 
    ? `${design.brandSettings.faviconUrl}?v=${new Date(design.brandSettings.updatedAt || Date.now()).getTime()}` 
    : '/favicon.ico';

  return {
    ...baseMetadata,
    metadataBase: new URL(currentUrl),
    alternates: {
      canonical: currentUrl,
    },
    title: {
      default: seoTitle,
      template: `%s | ${siteName}`,
    },
    description: seoDescription,
    icons: {
      icon: faviconUrl,
      apple: logoUrl,
    },
    openGraph: {
      ...baseMetadata.openGraph,
      title: seoTitle,
      description: seoDescription,
      siteName: siteName,
      images: [
        {
          url: `/api/og?tenantId=${tenantId}`,
          width: 1200,
          height: 630,
          alt: `${siteName} - ${seoDescription}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description: seoDescription,
      images: [`/api/og?tenantId=${tenantId}`],
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
  
  // Color principal. Lo pasamos enteramente a BrandProvider en _providers_.
  const rawPrimaryColor = design?.brandSettings?.primaryColor || design?.primary || "zinc";
  const primaryColor = rawPrimaryColor;
  const logoUrl = design?.brandSettings?.logoUrl || design?.brandSettings?.faviconUrl || design?.logo || '/images/branding/icon.png';
  const headerLinksFromDb = design?.headerLinks || null;
  const footerLinks = design?.footerLinks || null;
  const contactPhone = design?.contactPhone || null;
  const contactEmail = design?.contactEmail || null;
  const businessName = design?.name || null;
  const tenantTagline = design?.brandSettings?.tagline || design?.tagline || null;
  const tiktokPixelId = design?.tiktokPixelId || null;

  const headersList = await headers();
  const tenantFeaturesRaw = headersList.get('x-tenant-features');
  const tenantSlugRaw = headersList.get('x-tenant-slug') || tenantId; 
  
  console.log(`[LAYOUT DEBUG] tenantId=${tenantId}, slug=${tenantSlugRaw}`);

  let featureArray: string[] = [];
  if (tenantFeaturesRaw) {
    try {
      featureArray = JSON.parse(tenantFeaturesRaw);
    } catch (e) {
      console.warn("Failed to parse tenant features block");
    }
  }

  // ── Motor de Marca Blanca: Inyección de CSS Custom Properties ──
  const brand = design?.brandSettings;
  
  // ¿Es un color hexadecimal o HSL personalizado?
  const isCustomPrimary = brand?.primaryColor && (brand.primaryColor.startsWith('#') || brand.primaryColor.includes(' '));
  const isCustomSecondary = brand?.secondaryColor && (brand.secondaryColor.startsWith('#') || brand.secondaryColor.includes(' '));

  // ── Fuente del tenant (next/font/google self-hosted) ──
  const tenantFont = getTenantFont(brand?.fontFamily);

  const brandStyles: React.CSSProperties = {
    '--radius': `${brand?.borderRadius ?? 0.5}rem`,
    '--font-sans': `var(--font-tenant), ${tenantFont.family}, sans-serif`,
  } as React.CSSProperties;

  // Solo inyectar como inline styles (alta especificidad) si es un custom color para evitar pisar las clases de los themas (ej. "theme-red")  
  if (isCustomPrimary) {
    (brandStyles as any)['--primary'] = hexToHsl(brand.primaryColor);
    (brandStyles as any)['--primary-foreground'] = getContrastForegroundHsl(brand.primaryColor);
    (brandStyles as any)['--primary-readable'] = getReadablePrimaryHsl(brand.primaryColor);
  }

  if (isCustomSecondary) {
    (brandStyles as any)['--secondary'] = hexToHsl(brand.secondaryColor);
    (brandStyles as any)['--secondary-foreground'] = getContrastForegroundHsl(brand.secondaryColor);
  }

  return (
    <html lang="es" suppressHydrationWarning>
      <head />
      <body className={`${getFontVariables()} ${tenantFont.variable} font-sans antialiased`} style={brandStyles}>
        <AppProviders
          tenantId={tenantId}
          features={featureArray}
          headerLinks={headerLinksFromDb}
          footerLinks={footerLinks}
          contactPhone={contactPhone}
          contactEmail={contactEmail}
          businessName={businessName}
          tagline={tenantTagline}
          design={design}
          primaryColor={primaryColor}
          activePaymentProvider={design?.activePaymentProvider || 'NONE'}
          defaultTheme={design?.brandSettings?.defaultTheme || 'dark'}
        >
          <GlobalSchemas />
          <ToastProvider>
            {children}
            <PwaInstallPrompt />
            <TableDetector />
            {tiktokPixelId && <TikTokPixel pixelId={tiktokPixelId} />}
          </ToastProvider>
        </AppProviders>
      </body>
    </html>
  );
}
