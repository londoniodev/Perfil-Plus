import { BrandingForm } from "@/components/settings/BrandingForm";
import { PrismaClient } from "@alvarosky/database-management";
import { TENANT_ID } from "@/lib/config";
import { AdminPageWrapper } from "@alvarosky/ui";

const prisma = new PrismaClient();

import { headers } from "next/headers";

async function getTenantDesign() {
    try {
        const headersList = await headers();
        const tenantHeader = headersList.get('x-tenant-id');
        const slug = tenantHeader || TENANT_ID || 'cocinasiete';

        const tenant = await prisma.tenant.findUnique({
            where: { slug: slug },
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
            title="Marca y Diseño"
        >
            <div className="flex h-full flex-1 flex-col space-y-8">
                <BrandingForm defaultValues={design as any} />
            </div>
        </AdminPageWrapper>
    );
}
