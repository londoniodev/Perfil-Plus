import { headers } from "next/headers";
import { getTenantId } from "@/lib/config-server";
import { Fill } from "@alvarosky/ui";
import { ServicesSelector as MauroServices } from "@/components/storefronts/mauromera/servicios/ServicesSelector";

export default async function ServiciosPage() {
    const headersList = await headers();
    const tenantId = headersList.get("x-tenant-id") || await getTenantId();

    if (tenantId === "mauromera") {
        return <MauroServices />;
    }

    return (
        <Fill>
            <h1 className="text-2xl font-bold mb-4">Servicios</h1>
            <p className="text-muted-foreground">Próximamente detalle de servicios.</p>
        </Fill>
    );
}
