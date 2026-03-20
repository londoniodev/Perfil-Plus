import type { Metadata, Viewport } from "next";
import "@alvarosky/ui/globals.css";
import { GlobalSchemas } from "@/components/seo/JsonLd";
import { ToastProvider, getFontVariables } from "@alvarosky/ui";
import dynamic from "next/dynamic";
import { AppProviders } from "./providers";
import { getTenantId } from "@/lib/config-server";
import { getTenantDesign } from "@/lib/tenant-server";
import { baseMetadata } from "@/config/metadata";
import { siteConfig } from "@/config/site";
import { headers } from "next/headers";
import { hexToHsl, getContrastForegroundHsl } from "@alvarosky/shared";

const PwaInstallPrompt = dynamic(
  () => import("@alvarosky/ui/pwa-install-prompt").then((mod) => mod.PwaInstallPrompt)
);

const TableDetector = dynamic(
  () => import("@/components/shop/table-detector").then((mod) => mod.TableDetector)
);

// ── Fuentes dinámicas de Google Fonts ──────────────────────
const DEFAULT_FONT = "Inter";

function getGoogleFontUrl(fontFamily: string): string | null {
  // Extraer solo el nombre primario (antes de la coma)
  const fontName = fontFamily.split(",")[0].trim().replace(/["']/g, "");
  // Si es la fuente por defecto del sistema, no inyectamos link externo
  if (
    fontName.toLowerCase() === DEFAULT_FONT.toLowerCase() ||
    fontName.toLowerCase() === "system-ui" ||
    fontName.toLowerCase() === "sans-serif"
  ) {
    return null;
  }
  // Formatear para Google Fonts (ej: "Playfair Display" → "Playfair+Display")
  const formatted = fontName.replace(/\s+/g, "+");
  return `https://fonts.googleapis.com/css2?family=${formatted}:wght@300;400;500;600;700;800;900&display=swap`;
}

export async function generateMetadata(): Promise<Metadata> {
  const tenantId = await getTenantId();
  const design = await getTenantDesign(tenantId);
  const logoUrl = design?.brandSettings?.logoUrl || design?.logo || '/images/branding/icon.png';
  const siteName = design?.name || siteConfig.name;
  const tagline = design?.brandSettings?.tagline || design?.tagline || siteConfig.description;

  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") || headersList.get("host") || "localhost";
  const isLocal = host.includes("localhost") || host.includes("127.0.0.1") || host.includes(":");
  const protocol = isLocal ? "http" : "https";
  const currentUrl = `${protocol}://${host}`;

  const faviconUrl = design?.brandSettings?.faviconUrl || '/favicon.ico';

  return {
    ...baseMetadata,
    metadataBase: new URL(currentUrl),
    alternates: {
      canonical: currentUrl,
    },
    title: {
      default: `${siteName} | ${tagline}`,
      template: `%s | ${siteName}`,
    },
    description: tagline,
    icons: {
      icon: faviconUrl,
      apple: logoUrl,
    },
    openGraph: {
      ...baseMetadata.openGraph,
      title: `${siteName} | ${tagline}`,
      description: tagline,
      siteName: siteName,
      images: [
        {
          url: `/api/og?tenantId=${tenantId}`,
          width: 1200,
          height: 630,
          alt: `${siteName} - ${tagline}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${siteName} | ${tagline}`,
      description: tagline,
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
  
  // Color fallback: si brandSettings tiene un HEX personalizado, usar "custom"
  // para que BrandProvider NO sobreescriba las variables CSS ya inyectadas vía SSR.
  const rawPrimaryColor = design?.brandSettings?.primaryColor || design?.primary || "zinc";
  const primaryColor = rawPrimaryColor.startsWith('#') ? 'custom' : rawPrimaryColor;
  const logoUrl = design?.brandSettings?.logoUrl || design?.logo || '/images/branding/icon.png';
  const headerLinksFromDb = design?.headerLinks || null;
  const footerLinks = design?.footerLinks || null;
  const contactPhone = design?.contactPhone || null;
  const contactEmail = design?.contactEmail || null;
  const businessName = design?.name || null;
  const tenantTagline = design?.brandSettings?.tagline || design?.tagline || null;

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
  const brandStyles: React.CSSProperties = brand
    ? {
        '--primary': hexToHsl(brand.primaryColor),
        '--primary-foreground': getContrastForegroundHsl(brand.primaryColor),
        '--secondary': hexToHsl(brand.secondaryColor),
        '--secondary-foreground': getContrastForegroundHsl(brand.secondaryColor),
        '--radius': `${brand.borderRadius}rem`,
        '--font-sans': `"${brand.fontFamily.split(',')[0].trim()}", sans-serif`,
      } as React.CSSProperties
    : {};

  // ── Google Fonts dinámicas ──
  const googleFontUrl = brand ? getGoogleFontUrl(brand.fontFamily) : null;

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {googleFontUrl && (
          <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link rel="stylesheet" href={googleFontUrl} />
          </>
        )}
      </head>
      <body className={`${getFontVariables()} font-sans antialiased`} style={brandStyles}>
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
        >
          <GlobalSchemas />
          <ToastProvider>
            {children}
            <PwaInstallPrompt />
            <TableDetector />
          </ToastProvider>
        </AppProviders>
      </body>
    </html>
  );
}
