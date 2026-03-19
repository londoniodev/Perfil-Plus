import { headers } from "next/headers";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";

// Carga dinámica para optimizar el bundle multi-tenant
const DeborahLogros = dynamic(
  () => import("@/components/storefronts/deborahmoscoso/logros/LogrosContent").then(mod => mod.LogrosContent),
  {
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
        <p className="text-zinc-400">Cargando...</p>
      </div>
    ),
    ssr: true
  }
);

export default async function LogrosPage() {
    const headersList = await headers();
    const tenantSlug = headersList.get("x-tenant-slug") || "";
    const tenantId = headersList.get("x-tenant-id") || "";

    const isDeborah = tenantSlug === "soydeborasoysaludable" || tenantId === "cm7mman6x000208jsf3h9h2k1";

    if (isDeborah) {
        return <DeborahLogros />;
    }

    // Si no es el inquilino dueño de esta ruta, damos un 404
    return notFound();
}
