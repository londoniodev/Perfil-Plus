import { headers } from "next/headers";
import { Fill } from "@alvarosky/ui";
import MauroFormacion from "@/components/storefronts/mauromera/formacion/FormacionContent";

export default async function FormacionPage() {
    const headersList = await headers();
    const tenantSlug = headersList.get("x-tenant-slug") || "";

    switch (tenantSlug) {
        case "mauromera":
            return <MauroFormacion />;
        default:
            return (
                <Fill>
                    <h1 className="text-2xl font-bold mb-4">Formación</h1>
                    <p className="text-muted-foreground">Próximamente programas de formación.</p>
                </Fill>
            );
    }
}
