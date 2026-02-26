import { BrandingForm } from "@/components/settings/BrandingForm";
import { AdminPageWrapper } from "@alvarosky/ui";
import { serverFetch } from "@/lib/api-server";

async function getTenantDesign() {
    try {
        const design = await serverFetch<any>('/tenant/branding');
        return design || {};
    } catch (e) {
        return {};
    }
}

export default async function BrandingSettingsPage() {
    const design = await getTenantDesign();

    return (
        <AdminPageWrapper
            title="Marca y Diseño"
        >
            <div className="flex h-full flex-1 flex-col space-y-8">
                <BrandingForm defaultValues={design as any} />
            </div>
        </AdminPageWrapper>
    );
}
