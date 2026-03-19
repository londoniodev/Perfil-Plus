import { headers } from "next/headers";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";

export const metadata = {
    title: "Portafolio y Casos de Éxito",
    description: "Conoce mis trabajos, proyectos destacados y casos de éxito reales."
};

// Carga dinámica para optimizar el bundle multi-tenant
const MauroPortafolio = dynamic(
  () => import("@/components/storefronts/mauromera/portafolio/PortafolioContent"),
  {
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
        <p className="text-zinc-400">Cargando portafolio...</p>
      </div>
    ),
    ssr: true
  }
);

export default async function PortafolioPage() {
    const headersList = await headers();
    const tenantSlug = headersList.get("x-tenant-slug") || "";

    if (tenantSlug === "mauromera") {
        return <MauroPortafolio />;
    }

    // Para otros tenants que no tienen portafolio estático, damos un 404
    return notFound();
}
