import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getTenantId } from "@/lib/config-server";
import { TenantMarketingData } from "@/types/marketing";

import MauroLanding from "@/components/legacy/mauromera/Landing";
import DeborahLanding from "@/components/legacy/deborahmoscoso/Landing";
import DefaultLanding from "@/components/marketing/DefaultLanding";
import CocinasieteLanding from "@/components/legacy/cocinasiete/Landing";

const INTERNAL_API_URL = process.env.INTERNAL_API_URL || "http://127.0.0.1:3001/api";

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

export default async function MarketingHubPage() {
  const headersList = await headers();
  // El Edge Middleware ya nos regaló el ID en el túnel the proxy
  const tenantId = headersList.get("x-tenant-id") || await getTenantId();

  if (!tenantId) {
    return notFound();
  }

  const marketingData = await getMarketingData(tenantId);

  // Fallback the contingencia en caso the error en API o DB vacía para el cliente visual.
  const safeData: TenantMarketingData = marketingData || {
    tenantSlug: tenantId,
    heroTitle: "Plataforma SaaS Olympo",
    heroSubtitle: "Configurando entorno de inquilino...",
  };

  switch (safeData.tenantSlug) {
    case "mauromera":
      return <MauroLanding data={safeData} />;
    case "soydeborasoysaludable":
      return <DeborahLanding data={safeData} />;
    case "cocinasiete":
      return <CocinasieteLanding data={safeData} />;
    default:
      return <DefaultLanding data={safeData} />;
  }
}

