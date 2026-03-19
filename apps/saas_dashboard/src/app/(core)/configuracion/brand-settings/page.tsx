import { BrandSettingsForm } from "@/components/settings/BrandSettingsForm";
import { AdminPageWrapper } from "@alvarosky/ui";
import { serverFetch } from "@/lib/api-server";

async function getBrandSettings() {
    try {
        const branding = await serverFetch<any>('/tenant/branding');
        return branding?.brandSettings || {};
    } catch (e) {
        return {};
    }
}

export default async function BrandSettingsPage() {
    const brandSettings = await getBrandSettings();

    return (
        <AdminPageWrapper
            title="Configuración de Marca"
        >
            <div className="flex h-full flex-1 flex-col space-y-8">
                <BrandSettingsForm defaultValues={brandSettings} />
            </div>
        </AdminPageWrapper>
    );
}
