import type { Metadata, Viewport } from "next";
import "@alvarosky/ui/globals.css";
import { NavigationWrapper } from "@/components/layout/NavigationWrapper";
import { Footer } from "@/components/layout/Footer";
import { GlobalSchemas } from "@/components/seo/JsonLd";
import { ToastProvider, getFontVariables } from "@alvarosky/ui";
import { PwaInstallPrompt } from "@alvarosky/ui/pwa-install-prompt";
import { ThemeProvider } from "./providers";
import { BrandProvider } from "@alvarosky/ui";
import { siteConfig } from "@/config/site";
import { TableDetector } from "@/components/shop/table-detector";
import { serverFetch } from "@/lib/api-server";

interface TenantBranding {
  design: any;
  name: string | null;
  features: string[];
}

async function getTenantBranding(): Promise<TenantBranding | null> {
  // Skip API call during build time — API is not accessible in Docker build
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return null;
  }
  try {
    const branding = await serverFetch<TenantBranding>('/tenant/branding');
    return branding ?? null;
  } catch (e) {
    console.error("Error fetching tenant branding:", e);
    return null;
  }
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/**
 * Metadata dinámica: el <title> y las etiquetas OG se alimentan del nombre
 * del tenant obtenido desde la API, con fallback al siteConfig estático.
 */
export async function generateMetadata(): Promise<Metadata> {
  const branding = await getTenantBranding();
  const name = branding?.name || siteConfig.name;

  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: `${name} | Almuerzos Saludables`,
      template: `%s | ${name}`,
    },
    description: siteConfig.description,
    keywords: siteConfig.keywords,
    authors: [{ name, url: siteConfig.url }],
    creator: name,
    publisher: name,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      type: "website",
      locale: "es_CO",
      url: siteConfig.url,
      siteName: name,
      title: `${name} | Almuerzos Saludables`,
      description: siteConfig.description,
      images: [
        {
          url: siteConfig.ogImage,
          width: 1200,
          height: 630,
          alt: `${name} - Almuerzos Saludables`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} | Almuerzos Saludables`,
      description: siteConfig.description,
      images: [siteConfig.ogImage],
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
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#09090b",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const branding = await getTenantBranding();
  // Fallbacks firmes para evitar que SSR en dokploy rompa el frontend si el fetch interno the CNAME falla
  const tenantName = branding?.name || siteConfig.name;
  const logoUrl = branding?.design?.logoUrl || siteConfig.branding.logo;
  const primaryColor = branding?.design?.primary || "rose"; // ROJO: Color fallback predeterminado para Cocina Siete

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet" />
      </head>
      <body className={`${getFontVariables()} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={true}
        >
          <BrandProvider settings={{ ...branding?.design, primary: primaryColor } as any}>
            <GlobalSchemas />
            <ToastProvider>
              <NavigationWrapper
                footer={<Footer tenantName={tenantName} logoUrl={logoUrl} />}
                tenantName={tenantName}
                logoUrl={logoUrl}
              >
                {children}
              </NavigationWrapper>
              <PwaInstallPrompt />
              <TableDetector />
            </ToastProvider>
          </BrandProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
