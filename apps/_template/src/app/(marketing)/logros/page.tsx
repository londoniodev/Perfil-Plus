import { headers } from "next/headers";
import { Fill } from "@alvarosky/ui";
import { LogrosContent as DeborahLogros } from "@/components/storefronts/deborahmoscoso/logros/LogrosContent";

export default async function LogrosPage() {
    const headersList = await headers();
    const tenantSlug = headersList.get("x-tenant-slug") || "";
    const tenantId = headersList.get("x-tenant-id") || "";

    if (tenantSlug === "soydeborasoysaludable" || tenantId === "cm7mman6x000208jsf3h9h2k1") {
        return <DeborahLogros />;
    }

    return (
        <Fill>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-primary">Nuestros Logros</h1>
            <p className="text-muted-foreground text-lg text-center max-w-2xl">
                Esta sección está disponible exclusivamente para perfiles habilitados.
            </p>
        </Fill>
    );
}
