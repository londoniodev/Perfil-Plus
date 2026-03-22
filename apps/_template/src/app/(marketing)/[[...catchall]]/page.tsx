import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { unstable_cache } from "next/cache";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getTenantId } from "@/lib/config-server";
import { TenantMarketingData } from "@/types/marketing";
import { resolveLanding } from "@/lib/storefront-resolver";
import { Metadata } from "next";
import DefaultStorefront from "@/components/storefronts/shared/DefaultStorefront";

// ── S3 / MinIO Client ──
const s3 = new S3Client({
  endpoint: process.env.MINIO_ENDPOINT || "http://127.0.0.1:9000",
  region: process.env.MINIO_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY || "",
    secretAccessKey: process.env.MINIO_SECRET_KEY || "",
  },
  forcePathStyle: true, // Requerido para MinIO
});

const MINIO_BUCKET = process.env.MINIO_LANDING_BUCKET || "landings";
const INTERNAL_API_URL = process.env.INTERNAL_API_URL || "http://127.0.0.1:3001/api";

// ── Cached Landing Fetcher (MinIO → HTML string) ──
function createCachedLandingFetcher(tenantSlug: string) {
  return unstable_cache(
    async (): Promise<string | null> => {
      try {
        const key = `${tenantSlug}/index.html`;
        const command = new GetObjectCommand({
          Bucket: MINIO_BUCKET,
          Key: key,
        });

        const response = await s3.send(command);
        if (!response.Body) return null;

        const html = await response.Body.transformToString("utf-8");
        return html;
      } catch (error: unknown) {
        // NoSuchKey u otro error → no hay landing en MinIO
        const errorName = error instanceof Error ? error.name : "Unknown";
        if (errorName !== "NoSuchKey") {
          console.error(`[Landing] Error al leer landing de MinIO para ${tenantSlug}:`, error);
        }
        return null;
      }
    },
    [`tenant-landing-${tenantSlug}`],
    {
      revalidate: 3600, // 1 hora
      tags: [`tenant-landing-${tenantSlug}`],
    }
  );
}

// ── Metadata ──
export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const tenantSlug = headersList.get("x-tenant-slug") || headersList.get("x-tenant-id") || await getTenantId();

  if (tenantSlug === "alvarolondono" || tenantSlug === "xn--alvarolondoo-khb.dev") {
    return {
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
        revalidate: 3600,
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

  // ── MinIO Landing (reemplaza Plasmic) ──
  // Solo intentamos en la raíz del tenant (sin subrutas)
  if (!resolvedParams.catchall || resolvedParams.catchall.length === 0) {
    const fetchLanding = createCachedLandingFetcher(tenantSlug);
    const landingHtml = await fetchLanding();

    if (landingHtml) {
      // El HTML ya fue sanitizado por el pipeline de ingestión (DOMPurify)
      return (
        <div
          className="w-full h-full max-w-[100vw] overflow-x-hidden p-0 m-0"
          dangerouslySetInnerHTML={{ __html: landingHtml }}
        />
      );
    }
  }

  // ── Subrutas sin landing → 404 estricto ──
  if (resolvedParams.catchall && resolvedParams.catchall.length > 0) {
    return notFound();
  }

  // ── Legacy Fallback (Storefront Nativo) ──
  const marketingData = await getMarketingData(tenantId);

  const safeData: TenantMarketingData = marketingData || {
    tenantSlug: tenantId,
    heroTitle: "Plataforma SaaS Olympo",
    heroSubtitle: "Configurando entorno de inquilino...",
  };

  const LandingComponent = resolveLanding(safeData.tenantSlug);

  if (!LandingComponent) {
    return <DefaultStorefront data={safeData} />;
  }

  return (
    <div className="w-full h-full max-w-[100vw] overflow-x-hidden p-0 m-0">
      <LandingComponent data={safeData} />
    </div>
  );
}
