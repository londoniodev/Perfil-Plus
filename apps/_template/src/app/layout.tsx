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
import { getTenantId } from "@/lib/config-server";

async function getTenantDesign(tenantId: string) {
  // Skip DB call during build time (static generation) — API is not accessible in Docker build context easily
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return null;
  }
  try {
    const data = await serverFetch<any>('/tenant/branding');

    // Fallback robusto en caso de que la data venga incompleta o la API falle silenciosamente sin error
    return data?.design ?? {
      colors: { primary: "#000000" }, // Default safe color
      fonts: { heading: "Inter", body: "Inter" },
      radius: 0.5
    };
  } catch (e) {
    console.warn("⚠️ API de Branding inalcanzable. Usando UI de contingencia:", e);
    return {
      colors: { primary: "#000000" },
      fonts: { heading: "Inter", body: "Inter" },
      radius: 0.5
    };
  }
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
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

  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${getFontVariables()} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={true}
        >
          <BrandProvider settings={{ ...design, primary: primaryColor } as any}>
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


