import { headers } from "next/headers";
import { Fill } from "@alvarosky/ui";
import { ServicesSelector as MauroServices } from "@/components/storefronts/mauromera/servicios/ServicesSelector";
import { ServicesSelector as DeborahServices } from "@/components/storefronts/deborahmoscoso/servicios/ServicesSelector";

export default async function ServiciosPage() {
    const headersList = await headers();
    const tenantSlug = headersList.get("x-tenant-slug") || "";
    // Soporte para CUID de producción hardcodeado
    const tenantId = headersList.get("x-tenant-id") || "";

    if (tenantSlug === "mauromera") return <MauroServices />;
    if (tenantSlug === "soydeborasoysaludable" || tenantId === "cm7mman6x000208jsf3h9h2k1") return <DeborahServices />;

    return (
        <Fill>
            <h1 className="text-2xl font-bold mb-4">Servicios</h1>
            <p className="text-muted-foreground">Próximamente detalle de servicios.</p>
        </Fill>
    );
}
