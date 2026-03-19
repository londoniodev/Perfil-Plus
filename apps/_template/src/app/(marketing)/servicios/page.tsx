import { headers } from "next/headers";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";

// Carga dinámica para optimizar el bundle multi-tenant
const MauroServices = dynamic(
  () => import("@/components/storefronts/mauromera/servicios/ServicesSelector").then(mod => mod.ServicesSelector),
  {
    loading: () => <div className="min-h-screen flex items-center justify-center text-zinc-400">Cargando...</div>,
    ssr: true
  }
);

const DeborahServices = dynamic(
  () => import("@/components/storefronts/deborahmoscoso/servicios/ServicesSelector").then(mod => mod.ServicesSelector),
  {
    loading: () => <div className="min-h-screen flex items-center justify-center text-zinc-400">Cargando...</div>,
    ssr: true
  }
);

export default async function ServiciosPage() {
    const headersList = await headers();
    const tenantSlug = headersList.get("x-tenant-slug") || "";
    // Soporte para CUID de producción hardcodeado
    const tenantId = headersList.get("x-tenant-id") || "";

    if (tenantSlug === "mauromera") return <MauroServices />;
    if (tenantSlug === "soydeborasoysaludable" || tenantId === "cm7mman6x000208jsf3h9h2k1") return <DeborahServices />;

    // Para otros tenants sin servicios estáticos cableados, damos un 404
    return notFound();
}
