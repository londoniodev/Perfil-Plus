import { headers } from "next/headers";
import { getTenantId } from "@/lib/config-server";
import { Fill } from "@alvarosky/ui";
import MauroFormacion from "@/components/storefronts/mauromera/formacion/FormacionContent";

export default async function FormacionPage() {
    const headersList = await headers();
    const tenantId = headersList.get("x-tenant-id") || await getTenantId();

    if (tenantId === "mauromera") {
        return <MauroFormacion />;
    }

    return (
        <Fill>
            <h1 className="text-2xl font-bold mb-4">Formación</h1>
            <p className="text-muted-foreground">Próximamente programas de formación.</p>
        </Fill>
    );
}
