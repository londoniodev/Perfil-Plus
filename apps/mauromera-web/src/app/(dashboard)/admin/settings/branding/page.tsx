import { BrandingForm } from "@/components/settings/BrandingForm";
import { PrismaClient } from "@alvarosky/database-management";
import { TENANT_ID } from "@/lib/config";
import { AdminPageWrapper } from "@alvarosky/ui";

const prisma = new PrismaClient();

async function getTenantDesign() {
    try {
        const tenant = await prisma.tenant.findUnique({
            where: { slug: TENANT_ID },
            select: { design: true }
        });
        return tenant?.design || {};
    } catch (e) {
        return {};
    }
}

export default async function BrandingSettingsPage() {
    const design = await getTenantDesign();

    return (
        <AdminPageWrapper
            title="Diseño y Marca"
            description="Personaliza los colores y la apariencia de tu plataforma."
        >
            <div className="flex h-full flex-1 flex-col space-y-8">
                <BrandingForm defaultValues={design as any} />
            </div>
        </AdminPageWrapper>
    );
}
