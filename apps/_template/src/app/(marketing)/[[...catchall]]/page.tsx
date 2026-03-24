import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { unstable_cache } from "next/cache";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getTenantId } from "@/lib/config-server";
import { TenantMarketingData } from "@/types/marketing";
import { getBucketName } from "@alvarosky/shared";
import { resolveLanding } from "@/lib/storefront-resolver";
import { Metadata } from "next";
import DefaultStorefront from "@/components/storefronts/shared/DefaultStorefront";

// ── S3 / MinIO Client (usa las mismas variables S3_* que el backend) ──
const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT || "http://127.0.0.1:9000",
  region: process.env.S3_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || "",
    secretAccessKey: process.env.S3_SECRET_KEY || "",
  },
  forcePathStyle: true, // Requerido para MinIO
});
const INTERNAL_API_URL = process.env.INTERNAL_API_URL || "http://127.0.0.1:3001/api";

// ── Types ──
interface LandingData {
  body: string;
  meta: {
    title: string;
    description: string;
    og: Record<string, string>;
  };
}

// ── Metadata ──
const S3_PUBLIC_ENDPOINT = (process.env.S3_ENDPOINT || "http://127.0.0.1:9000").replace(/\/+$/, "");

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
      next: { tags: [`tenant-${tenantId}-${pageSlug}`, `tenant-${tenantId}-store`] },
      cache: 'force-cache'
    });
    if (!bodyRes.ok) return null;
    const body = await bodyRes.text();

    // 2. Fetch Meta con Tags
    const metaRes = await fetch(metaUrl, {
      next: { tags: [`tenant-${tenantId}-${pageSlug}`, `tenant-${tenantId}-store`] },
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

  // Fallback metadata for hardcoded segments or default
  if (tenantSlug === "alvarolondono" || tenantSlug === "xn--alvarolondoo-khb.dev") {
    return {
      title: "Álvaro Londoño | Consultoría Tech & SaaS",
      other: {
        "facebook-domain-verification": "wa9miawih97u6xsx1yhc1ub3w9dy0a",
      },
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

  if (!tenantId || !tenantSlug) {
    return notFound();
  }

  // 1. Intentar resolver la ruta desde S3 (Prioridad 1: Dinámico/Headless)
  const pageSlug = resolvedParams.catchall?.join("/") || "home";
  const landing = await fetchLandingFromS3(tenantId, tenantSlug, pageSlug);

  if (landing?.body) {
    // Sanitizar HTML de S3: eliminar <header>, <nav> y <footer> embebidos
    // para evitar duplicación visual con el layout nativo de la app.
    const sanitizedBody = landing.body
      .replace(/<nav[\s\S]*?<\/nav>/gi, '') // Eliminar <nav> (siempre es navegación)
      .replace(/<header[^>]*?class="[^"]*?(?:navbar|nav-container|menu)[^"]*"[\s\S]*?<\/header>/gi, '') // Solo headers de navegación
      .replace(/<footer[\s\S]*?<\/footer>/gi, ''); // Eliminar <footer> (siempre estructural duplicado)

    return (
      <div
        className="w-full min-h-screen max-w-[100vw] overflow-x-hidden p-0 m-0"
        dangerouslySetInnerHTML={{ __html: sanitizedBody }}
      />
    );
  }

  // 2. Si no hay landing en S3 y es la raíz, intentar el Fallback Native (Legacy Components)
  if (pageSlug === "home") {
    const marketingData = await getMarketingData(tenantId);
    
    // Si no hay datos de marketing en la API, usamos un default mínimo
    const safeData: TenantMarketingData = marketingData || {
      tenantSlug: tenantSlug,
      heroTitle: "Plataforma SaaS Olympo",
      heroSubtitle: "Configurando entorno de inquilino...",
    };

    const LandingComponent = resolveLanding(safeData.tenantSlug);

    if (LandingComponent) {
      return (
        <div className="w-full min-h-screen max-w-[100vw] overflow-x-hidden p-0 m-0">
          <LandingComponent data={safeData} />
        </div>
      );
    }
    
    // Último recurso: Storefront genérico
    return <DefaultStorefront data={safeData} />;
  }

  // 3. Si no es la home y no hay contenido en S3 -> 404
  return notFound();
}
