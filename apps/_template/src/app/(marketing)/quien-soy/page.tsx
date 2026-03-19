import { headers } from "next/headers";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";

export const metadata = {
    title: "Quién Soy",
    description: "Conoce mi historia, mi filosofía y cómo conecto la nutrición consciente con el entrenamiento para Transformarte."
};

// Carga dinámica para optimizar el bundle multi-tenant
const DeborahAbout = dynamic(
  () => import("@/components/storefronts/deborahmoscoso/quien-soy/AboutContent").then(mod => mod.AboutContent),
  {
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
        <p className="text-zinc-400">Cargando...</p>
      </div>
    ),
    ssr: true
  }
);

export default async function QuienSoyPage() {
    const headersList = await headers();
    const tenantSlug = headersList.get("x-tenant-slug") || "";
    const tenantId = headersList.get("x-tenant-id") || "";

    const isDeborah = tenantSlug === "soydeborasoysaludable" || tenantId === "cm7mman6x000208jsf3h9h2k1";

    if (isDeborah) {
        return <DeborahAbout />;
    }

    // Para otros tenants sin 'Quién Soy' estático, damos un 404
    return notFound();
}
