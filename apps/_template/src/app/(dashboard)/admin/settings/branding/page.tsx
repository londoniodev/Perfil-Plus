import { BrandingForm } from "@/components/settings/BrandingForm";
import { PrismaClient } from "@alvarosky/database-management";
import { TENANT_ID } from "@/lib/config";

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
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Marca y Diseño</h2>
            </div>
            <div className="flex h-full flex-1 flex-col space-y-8">
                <BrandingForm defaultValues={design as any} />
            </div>
        </div>
    );
}
