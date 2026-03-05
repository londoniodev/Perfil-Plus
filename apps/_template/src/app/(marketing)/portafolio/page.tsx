import { headers } from "next/headers";
import { getTenantId } from "@/lib/config-server";
import { Fill } from "@alvarosky/ui";
import MauroPortafolio from "@/components/storefronts/mauromera/portafolio/PortafolioContent";

export default async function PortafolioPage() {
    const headersList = await headers();
    const tenantId = headersList.get("x-tenant-id") || await getTenantId();

    if (tenantId === "mauromera") {
        return <MauroPortafolio />;
    }

    return (
        <Fill>
            <h1 className="text-2xl font-bold mb-4">Portafolio</h1>
            <p className="text-muted-foreground">Próximamente casos de éxito.</p>
        </Fill>
    );
}
