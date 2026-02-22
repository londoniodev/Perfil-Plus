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
import { prisma } from "@/lib/prisma";
import { getTenantId } from "@/lib/config-server";

async function getTenantDesign(tenantId: string) {
  // Skip DB call during build time (static generation) — DB is not accessible in Docker build
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return null;
  }
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantId },
      select: { design: true },
    });
    return tenant?.design ?? null;
  } catch (e) {
    console.error("Error fetching tenant design:", e);
    return null;
  }
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | Almuerzos Saludables`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
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
    title: `${siteConfig.name} | Almuerzos Saludables`,
    description: siteConfig.description,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} - Almuerzos Saludables`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} | Almuerzos Saludables`,
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

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet" />
      </head>
      <body className={`${getFontVariables()} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          forcedTheme="dark"
        >
          <BrandProvider settings={design as any}>
            <GlobalSchemas />
            <ToastProvider>
              <NavigationWrapper footer={<Footer />}>
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


