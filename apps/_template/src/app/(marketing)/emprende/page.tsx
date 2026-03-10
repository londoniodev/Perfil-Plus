import { headers } from "next/headers";
import { Fill } from "@alvarosky/ui";
import { EmprendeContent as DeborahEmprende } from "@/components/storefronts/deborahmoscoso/emprende/EmprendeContent";

export default async function EmprendePage() {
    const headersList = await headers();
    const tenantSlug = headersList.get("x-tenant-slug") || "";
    const tenantId = headersList.get("x-tenant-id") || "";

    if (tenantSlug === "soydeborasoysaludable" || tenantId === "cm7mman6x000208jsf3h9h2k1") {
        return <DeborahEmprende />;
    }

    return (
        <Fill>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-primary">Emprende Conmigo</h1>
            <p className="text-muted-foreground text-lg text-center max-w-2xl">
                Próximamente encontrarás aquí toda la información sobre cómo unirte a mi equipo y empezar tu propio negocio.
            </p>
        </Fill>
    );
}
