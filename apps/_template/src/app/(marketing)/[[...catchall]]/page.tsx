import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getTenantId } from "@/lib/config-server";
import { getTenantDesign } from "@/lib/tenant-server";
import { FEATURE_ROUTES } from "@alvarosky/types";
import { TenantMarketingData } from "@/types/marketing";
import { getBucketName } from "@alvarosky/shared";
import { Metadata } from "next";
import DOMPurify from "isomorphic-dompurify";
import DefaultStorefront from "@/components/storefronts/shared/DefaultStorefront";
import LinktreeFallback from "@/components/marketing/LinktreeFallback";
import LandingRenderer from "@/components/marketing/LandingRenderer";

// ── Constants ──
const INTERNAL_API_URL = process.env.INTERNAL_API_URL || "http://127.0.0.1:3001/api";
const S3_PUBLIC_ENDPOINT = (process.env.S3_ENDPOINT || "http://127.0.0.1:9000").replace(/\/+$/, "");

// ── Domain Resilience ──
// Dominios S3 históricos/legados que pueden estar quemados en archivos body.html almacenados.
// Al añadir la URL actual también, nos aseguramos de que la regex no haga reemplazos rotos.
const LEGACY_S3_DOMAINS = [
  /https?:\/\/s3\.xn--alvarolondoo-khb\.dev/g,   // Punycode del dominio anterior
  /https?:\/\/s3\.alvarolondo[ñn]o\.dev/g,        // Unicode del dominio anterior
  /https?:\/\/localhost:9000/g,                     // Entorno de desarrollo local
];

/**
 * Reescribe cualquier referencia a un dominio S3 legacy/anterior en el HTML
 * por el endpoint S3 actual configurado en la variable de entorno.
 * Esto hace al renderer inmune a futuras migraciones de dominio.
 */
function rebaseAssetUrls(html: string, currentEndpoint: string): string {
  let result = html;
  for (const pattern of LEGACY_S3_DOMAINS) {
    result = result.replace(pattern, currentEndpoint);
  }
  return result;
}

// ── Types ──
interface LandingData {
  body: string;
  meta: {
    title: string;
    description: string;
    og: Record<string, string>;
  };
}

/**
 * Fetcher dinámico que usa el fetch nativo de Next.js para aprovechar
 * las etiquetas de caché (next.tags) solicitadas por arquitectura.
 */
async function fetchLandingFromS3(tenantId: string, tenantSlug: string, pageSlug: string = "home"): Promise<LandingData | null> {
  try {
    const bucket = getBucketName(tenantSlug, false);
    const bodyUrl = `${S3_PUBLIC_ENDPOINT}/${bucket}/landings/${pageSlug}/body.html`;
    const metaUrl = `${S3_PUBLIC_ENDPOINT}/${bucket}/landings/${pageSlug}/meta.json`;

    // 1. Fetch Body con Tags
    const bodyRes = await fetch(bodyUrl, {
      next: { tags: [`tenant-${tenantId}-${pageSlug}`, `tenant-${tenantId}-store`, `landings-${tenantSlug}`] },
      cache: 'force-cache'
    });
    if (!bodyRes.ok) return null;
    const body = await bodyRes.text();

    // 2. Fetch Meta con Tags
    const metaRes = await fetch(metaUrl, {
      next: { tags: [`tenant-${tenantId}-${pageSlug}`, `tenant-${tenantId}-store`, `landings-${tenantSlug}`] },
      cache: 'force-cache'
    });
    if (!metaRes.ok) return null;
    const meta = await metaRes.json();

    return { body, meta };
  } catch (error) {
    console.error(`[Landing SDK Fallback] Falló fetch nativo de S3:`, error);
    return null;
  }
}

// ── Metadata ──
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const headersList = await headers();
  const tenantId = headersList.get("x-tenant-id");
  const tenantSlug = headersList.get("x-tenant-slug");
  const resolvedParams = await params;

  if (tenantId && tenantSlug) {
    const pageSlug = resolvedParams.catchall?.join("/") || "home";
    const landing = await fetchLandingFromS3(tenantId, tenantSlug, pageSlug);

    if (landing?.meta) {
      return {
        title: landing.meta.title,
        description: landing.meta.description,
        openGraph: {
          title: landing.meta.og["og:title"] || landing.meta.title,
          description: landing.meta.og["og:description"] || landing.meta.description,
          url: landing.meta.og["og:url"],
          type: "website",
        },
      };
    }
  }

  // Fallback metadata
  if (tenantSlug === "alvarolondono") {
    return {
      title: "Álvaro Londoño | Consultoría Tech & SaaS",
    };
  }

  return {};
}

// ── Marketing Data Fetcher ──
async function getMarketingData(tenantId: string): Promise<TenantMarketingData | null> {
  try {
    const res = await fetch(`${INTERNAL_API_URL}/tenant/marketing?tenant=${tenantId}`, {
      headers: {
        "x-internal-token": process.env.INTERNAL_API_KEY || "default_dev_secret_key",
      },
      next: {
        tags: ["tenant-marketing", `tenant-marketing-${tenantId}`],
      },
    });

    if (!res.ok) return null;
    return await res.json() as TenantMarketingData;
  } catch (error) {
    console.error(`[Marketing] Falló fetch de datos de marketing para tenant ${tenantId}`, error);
    return null;
  }
}

// ── Page Component ──
type Props = {
  params: Promise<{ catchall?: string[] }>;
};

export default async function MarketingHubPage({ params }: Props) {
  const resolvedParams = await params;
  const headersList = await headers();

  const tenantId = headersList.get("x-tenant-id") || await getTenantId();
  const tenantSlug = headersList.get("x-tenant-slug");
  const featuresStr = headersList.get("x-tenant-features");
  let features: string[] = [];
  if (featuresStr) {
    try {
      features = JSON.parse(featuresStr);
    } catch (e) {
      features = featuresStr.split(",").filter(Boolean);
    }
  }
  features = features.map(f => f.toUpperCase());

  if (!tenantId || !tenantSlug) {
    return notFound();
  }

  const design = await getTenantDesign(tenantId);
  const marketingData = await getMarketingData(tenantId);

  // Unificar features (Headers + DB) para evitar falsos negativos del Fallback
  const allFeatures = Array.from(new Set([
    ...features,
    ...(design?.features || [])
  ])).map(f => f.toUpperCase());
  
  const upperFeaturesSet = new Set(allFeatures);
    const hasLandingFeature = upperFeaturesSet.has("LANDING");
    const pageSlug = resolvedParams.catchall?.join("/") || "home";

    if (!hasLandingFeature) {
        // Si no tiene el feature LANDING activo -> Solo mostramos enlaces de features fijas
        // Ocultamos los enlaces personalizados (headerLinks) ya que pertenecen al sitio web desactivado.
        const navLinks: { label: string; href: string }[] = [];
        if (upperFeaturesSet.has('RESTAURANT')) navLinks.push(FEATURE_ROUTES.RESTAURANT);
        if (upperFeaturesSet.has('SHOP')) navLinks.push(FEATURE_ROUTES.SHOP);
        if (upperFeaturesSet.has('BLOG')) navLinks.push(FEATURE_ROUTES.BLOG);
        if (upperFeaturesSet.has('LMS')) navLinks.push(FEATURE_ROUTES.LMS);
        
        const finalLinks = [...navLinks]; // <--- Solo navLinks, quitamos design?.headerLinks
    
    return (
      <LinktreeFallback 
        tenantSlug={tenantSlug} 
        marketingData={marketingData || undefined}
        navLinks={finalLinks}
        branding={{
          logoUrl: design?.brandSettings?.logoUrl || design?.brandSettings?.faviconUrl || design?.logo || undefined,
          primaryColor: design?.brandSettings?.primaryColor,
          backgroundImageUrl: design?.brandSettings?.authBgUrl 
        }}
        socialLinks={design?.socialLinks}
      />
    );
  }

  // 1. Intentar resolver la ruta desde S3 (Prioridad 1: Dinámico/Headless)
  const landing = await fetchLandingFromS3(tenantId, tenantSlug, pageSlug);

  if (landing?.body) {
    // 1. Rebase: normalizar URLs de S3 legadas al endpoint actual
    const rebasedBody = rebaseAssetUrls(landing.body, S3_PUBLIC_ENDPOINT);

    // 2. Convertir rutas RELATIVAS a URLs absolutas de S3
    //    El body.html puede usar href="./assets/..." o src="../../nuevas imagenes/..."
    //    que en el contexto de Next.js no existen. Reescribimos todo a S3.
    const bucket = getBucketName(tenantSlug!, false);
    const s3AssetsBase = `${S3_PUBLIC_ENDPOINT}/${bucket}/landings/${pageSlug}`;
    const s3BucketBase = `${S3_PUBLIC_ENDPOINT}/${bucket}`;
    let absoluteBody = rebasedBody
      // Rutas relativas simples: ./assets/...
      .replace(/href=["']\.\//g, `href="${s3AssetsBase}/`)
      .replace(/src=["']\.\//g, `src="${s3AssetsBase}/`)
      // Rutas relativas con ../ (ej: ../../nuevas imagenes/...)
      .replace(/src=["'](?:\.\.\/)+/g, `src="${s3BucketBase}/`)
      .replace(/href=["'](?:\.\.\/)+/g, `href="${s3BucketBase}/`);

    // 3. Extraer URLs de <link rel="stylesheet"> ANTES de que DOMPurify las elimine
    //    DOMPurify remueve <link> por seguridad, pero necesitamos el CSS externo.
    //    Las URLs se validan con whitelist en LandingRenderer (client-side).
    const stylesheetUrls: string[] = [];
    const linkRegex = /<link[^>]+rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/gi;
    let linkMatch: RegExpExecArray | null;
    while ((linkMatch = linkRegex.exec(absoluteBody)) !== null) {
      stylesheetUrls.push(linkMatch[1]);
    }
    // También capturar <link href="..." rel="stylesheet"> (orden invertido)
    const linkRegex2 = /<link[^>]+href=["']([^"']+)["'][^>]*rel=["']stylesheet["'][^>]*>/gi;
    while ((linkMatch = linkRegex2.exec(absoluteBody)) !== null) {
      if (!stylesheetUrls.includes(linkMatch[1])) {
        stylesheetUrls.push(linkMatch[1]);
      }
    }

    // 4. Pre-Sanitizar HTML de S3 (eliminar nav/footer duplicados del builder)
    let preSanitizedBody = absoluteBody
      .replace(/<nav[\s\S]*?<\/nav>/gi, '') 
      .replace(/<header[^>]*?class="[^"]*?(?:navbar|nav-container|menu)[^"]*"[\s\S]*?<\/header>/gi, '')
      .replace(/<footer[\s\S]*?<\/footer>/gi, '');

    // 5. Purificación estricta (XSS Shield)
    // DOMPurify elimina <link>, <style> importados y scripts.
    // Los stylesheets ya fueron extraídos en el paso 3 y se inyectarán aparte.
    const finalCleanBody = DOMPurify.sanitize(preSanitizedBody, {
      USE_PROFILES: { html: true, svg: true },
    });
    // 6. Renderizar los <link> de CSS directamente como JSX server-side
    //    Esto elimina el FOUC (Flash of Unstyled Content) porque el CSS
    //    viaja junto con el HTML inicial, sin esperar a useEffect del cliente.
    const logoUrl = design?.brandSettings?.logoUrl || design?.brandSettings?.faviconUrl || design?.logo || undefined;
    const primaryColor = design?.brandSettings?.primaryColor || "#3b82f6";

    return (
      <>
        {stylesheetUrls.map((url) => (
          <link key={url} rel="stylesheet" href={url} />
        ))}
        <LandingRenderer
          html={finalCleanBody}
          logoUrl={logoUrl}
          primaryColor={primaryColor}
        />
      </>
    );
  }

  // 2. Si no hay landing en S3 y es la raíz, aplicar Lógica DefaultStorefront / Olympo SaaS
  if (pageSlug === "home") {
    // Si tiene LANDING activo pero falló S3 -> DefaultStorefront
    const marketingData = await getMarketingData(tenantId);
    const safeData: TenantMarketingData = marketingData || {
      tenantSlug: tenantSlug,
      heroTitle: "Plataforma SaaS Olympo",
      heroSubtitle: "Configurando entorno de inquilino...",
    };

    return <DefaultStorefront data={safeData} />;
  }

  // 3. Si no es la home y no hay contenido en S3 -> 404
  return notFound();
}

