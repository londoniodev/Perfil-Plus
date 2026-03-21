import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getTenantId } from "@/lib/config-server";
import { TenantMarketingData } from "@/types/marketing";
import { resolveLanding } from "@/lib/storefront-resolver";
import { Metadata } from "next";

// ── Plasmic SDK (Strangler Fig) ──
import { PLASMIC } from "@/plasmic-init";
import { PlasmicClientRootProvider } from "@/plasmic-init-client";
import { PlasmicComponent } from "@plasmicapp/loader-nextjs";

const INTERNAL_API_URL = process.env.INTERNAL_API_URL || "http://127.0.0.1:3001/api";

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  // x-tenant-slug suele ser el slug legible del inquilino
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

async function getMarketingData(tenantId: string): Promise<TenantMarketingData | null> {
  try {
    const res = await fetch(`${INTERNAL_API_URL}/tenant/marketing?tenant=${tenantId}`, {
      headers: {
        'x-internal-token': process.env.INTERNAL_API_KEY || 'default_dev_secret_key',
      },
      next: {
        revalidate: 3600, // Usar 1 hora es seguro, el webhook purgará a la fuerza
        tags: ["tenant-marketing", `tenant-marketing-${tenantId}`],
      },
    });

    if (!res.ok) return null;
    return await res.json() as TenantMarketingData;
  } catch (error) {
    console.error(`Edge Factory: Falló Fetch the Marketing Data para el tenant ${tenantId}`, error);
    return null;
  }
}

import DefaultStorefront from "@/components/storefronts/shared/DefaultStorefront";

export default async function MarketingHubPage() {
  const headersList = await headers();
  // El Edge Middleware ya nos regaló el ID y el SLUG en el túnel del proxy
  const tenantId = headersList.get("x-tenant-id") || await getTenantId();
  const tenantSlug = headersList.get("x-tenant-slug");

  if (!tenantId || !tenantSlug) {
    return notFound();
  }

  // ── Strangler Fig: Intento de resolver la landing desde Plasmic ──
  // Usamos el SLUG para diferenciar tenants dentro del Workspace compartido.
  // En Plasmic, cada tenant tiene su página bajo /{slug} (ej: /mauromera).
  // Si Plasmic no tiene una página publicada para este slug, retorna null
  // y el flujo cae al código legacy de forma transparente.
  const plasmicPath = `/${tenantSlug}`;
  const plasmicData = await PLASMIC.maybeFetchComponentData(plasmicPath).catch(() => null);

  if (plasmicData) {
    return (
      <PlasmicClientRootProvider prefetchedData={plasmicData}>
        <PlasmicComponent component={plasmicData.entryCompMetas[0].displayName} />
      </PlasmicClientRootProvider>
    );
  }

  // ── Legacy Fallback: Storefront Registry + DefaultStorefront ──
  // Este bloque es el código original INTACTO. Se ejecuta cuando el tenant
  // NO tiene una landing publicada en Plasmic.
  const marketingData = await getMarketingData(tenantId);

  // Fallback the contingencia en caso the error en API o DB vacía para el cliente visual.
  const safeData: TenantMarketingData = marketingData || {
    tenantSlug: tenantId,
    heroTitle: "Plataforma SaaS Olympo",
    heroSubtitle: "Configurando entorno de inquilino...",
  };

  const LandingComponent = resolveLanding(safeData.tenantSlug);

  if (!LandingComponent) {
    return (
      <DefaultStorefront data={safeData} />
    );
  }

  return (
    <div className="w-full h-full max-w-[100vw] overflow-x-hidden p-0 m-0">
        <LandingComponent data={safeData} />
    </div>
  );
}

