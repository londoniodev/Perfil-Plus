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
      footerLinks: data?.footerLinks || null,
      contactEmail: data?.contactEmail || null,
      contactPhone: data?.contactPhone || null,
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
          width: 1200,
          height: 630,
          alt: `${siteName} Logo`,
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
  const headerLinksFromDb = design?.headerLinks || null;
  const footerLinks = design?.footerLinks || null;
  const contactPhone = design?.contactPhone || null;
  const contactEmail = design?.contactEmail || null;
  const businessName = design?.name || null;
  const tenantTagline = design?.tagline || null;

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

  // --- LÓGICA DE NAVEGACIÓN (Server Side) ---
  let navLinks = headerLinksFromDb ? [...headerLinksFromDb] : [];
  
  if (navLinks.length === 0) {
      navLinks = [{ label: "Inicio", href: "/" }];
      const upperFeatures = featureArray.map(f => f.toUpperCase());
      if (upperFeatures.includes("ECOMMERCE") || upperFeatures.includes("ECOMERCE")) navLinks.push({ label: "Tienda", href: "/tienda" });
      if (upperFeatures.includes("LMS")) navLinks.push({ label: "Cursos", href: "/formacion" });
      if (upperFeatures.includes("BLOG")) navLinks.push({ label: "Blog", href: "/blog" });
      if (upperFeatures.includes("RESTAURANT")) navLinks.push({ label: "Menú", href: "/menu" });
  } else {
      const upperFeatures = featureArray.map(f => f.toUpperCase());
      const hasTiendaLink = navLinks.some(link => link.href === "/tienda");
      if ((upperFeatures.includes("ECOMMERCE") || upperFeatures.includes("ECOMERCE")) && !hasTiendaLink) {
          navLinks.push({ label: "Tienda", href: "/tienda" });
      }
  }

  // --- LÓGICA DE BRANDING (Server Side) ---
  let logoSuffix: React.ReactNode = null;
  if (tenantSlugRaw === "soydeborasoysaludable" || tenantId === "cm7mman6x000208jsf3h9h2k1") {
      logoSuffix = (
          <span className="text-lg md:text-xl font-black tracking-tighter uppercase italic leading-none hidden sm:block">
              Soy <span className="text-fuchsia-500">Deborah</span> Soy Saludable
          </span>
      );
  }

  const hasDashboardFeature = featureArray.includes('dashboard') || featureArray.length > 0;
  const isCocinaSiete = tenantSlugRaw === "cocinasiete" || tenantId === "cocinasiete";
  const isDarkThemeTenant = tenantSlugRaw === "mauromera" || tenantSlugRaw === "soydeborasoysaludable";

  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${getFontVariables()} font-sans antialiased`}>
        <TenantProvider
          tenantId={tenantId}
          features={featureArray}
          headerLinks={headerLinksFromDb}
          footerLinks={footerLinks}
          contactPhone={contactPhone}
          contactEmail={contactEmail}
          businessName={businessName}
          tagline={tenantTagline}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme={isDarkThemeTenant ? "dark" : "light"}
            enableSystem={!isDarkThemeTenant}
            forcedTheme={isDarkThemeTenant ? "dark" : undefined}
          >
            <BrandProvider settings={{ ...design, primary: primaryColor } as any}>
              <GlobalSchemas />
              <ToastProvider>
                <NavigationWrapper 
                  logo={logoUrl} 
                  logoSuffix={logoSuffix}
                  links={navLinks}
                  showAuthButtons={hasDashboardFeature}
                  isCocinaSiete={isCocinaSiete}
                  footer={
                    <Footer 
                      logo={logoUrl} 
                      footerLinks={footerLinks} 
                      businessName={businessName || undefined} 
                      businessEmail={contactEmail || undefined} 
                      businessPhone={contactPhone || undefined} 
                      tagline={tenantTagline || undefined} 
                      features={featureArray} 
                    />
                  }
                >
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


