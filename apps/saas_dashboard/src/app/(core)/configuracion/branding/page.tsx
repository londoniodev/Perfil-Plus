import { BrandingForm } from "@/components/settings/BrandingForm";
import { AdminPageWrapper } from "@alvarosky/ui";
import { serverFetch } from "@/lib/api-server";

async function getTenantDesign() {
    try {
        const data = await serverFetch<any>('/tenant/branding');
        return data || {};
    } catch (e) {
        return {};
    }
}

/**
 * Mapea la respuesta cruda de la API (BrandSettings de Prisma)
 * a los campos que espera el BrandingForm (brandingSchema de Zod).
 * 
 * BD fields → Form fields:
 * - primaryColor → primary
 * - borderRadius → radius
 * - fontFamily → fontFamily (sin cambio)
 * - logoUrl → logoUrl (sin cambio)
 * - faviconUrl → faviconUrl (sin cambio)
 * - secondaryColor → secondaryColor (sin cambio)
 */
function mapApiToFormValues(apiData: any) {
    const bs = apiData?.brandSettings;
    if (!bs) return undefined;

    return {
        primary: bs.primaryColor || "",
        radius: bs.borderRadius ?? 0.5,
        density: "default" as const,
        mode: (bs.theme || "dark") as "light" | "dark" | "system",
        logoUrl: bs.logoUrl || "",
        faviconUrl: bs.faviconUrl || "",
        secondaryColor: bs.secondaryColor || "",
        fontFamily: bs.fontFamily?.split(",")[0]?.trim() || "Inter",
        metaTitle: bs.metaTitle || "",
        metaDescription: bs.metaDescription || "",
        authBgUrl: bs.authBgUrl || "",
        authQuote: bs.authQuote || "",
    };
}

export default async function BrandingSettingsPage() {
    const design = await getTenantDesign();
    const formValues = mapApiToFormValues(design);

    return (
        <AdminPageWrapper
            title="Marca y Diseño"
        >
            <div className="flex h-full flex-1 flex-col space-y-8">
                <BrandingForm defaultValues={formValues} />
            </div>
        </AdminPageWrapper>
    );
}
