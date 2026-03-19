import { headers } from "next/headers";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";

// Carga dinámica para no cargar el código en el bundle si no eres Deborah
const DeborahEmprende = dynamic(
  () => import("@/components/storefronts/deborahmoscoso/emprende/EmprendeContent").then(mod => mod.EmprendeContent),
  {
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
        <p className="text-zinc-400">Cargando...</p>
      </div>
    ),
    ssr: true // Habilitar SSR para SEO de Deborah
  }
);

export const metadata = {
    title: "Emprende Conmigo",
    description: "Únete a mi equipo de distribución, trabaja desde casa y transforma tu estilo de vida gestionando tu propio negocio."
};

export default async function EmprendePage() {
    const headersList = await headers();
    const tenantSlug = headersList.get("x-tenant-slug") || "";
    const tenantId = headersList.get("x-tenant-id") || "";

    const isDeborah = tenantSlug === "soydeborasoysaludable" || tenantId === "cm7mman6x000208jsf3h9h2k1";

    if (isDeborah) {
        return <DeborahEmprende />;
    }

    // Si no es el inquilino que tiene esta característica, damos un 404 dinámico
    // para que no ensucie el SEO del resto de tenants.
    return notFound();
}
