import { headers } from "next/headers";
import { Fill } from "@alvarosky/ui";
import MauroPortafolio from "@/components/storefronts/mauromera/portafolio/PortafolioContent";

export default async function PortafolioPage() {
    const headersList = await headers();
    const tenantSlug = headersList.get("x-tenant-slug") || "";

    switch (tenantSlug) {
        case "mauromera":
            return <MauroPortafolio />;
        default:
            return (
                <Fill>
                    <h1 className="text-2xl font-bold mb-4">Portafolio</h1>
                    <p className="text-muted-foreground">Próximamente casos de éxito.</p>
                </Fill>
            );
    }
}
