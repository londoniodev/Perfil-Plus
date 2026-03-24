import { TenantConfigPanel } from "@/components/superadmin/tenant-config-panel";
import { getSessionUser } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { prisma } from "@alvarosky/database";

interface Props {
    params: Promise<{ slug: string }>;
}

export default async function TenantSettingsPage({ params }: Props) {
    const user = await getSessionUser();
    if (!user || user.role !== "SUPERADMIN") redirect("/dashboard");

    const resolvedParams = await params;
    const slug = resolvedParams.slug;

    const tenant = await prisma.tenant.findUnique({
        where: { slug }
    });

    if (!tenant) return <div className="p-8 text-white">Tenant no encontrado (Error 404)</div>;

    return (
        <div className="p-4 sm:p-6 w-full">
            <h1 className="text-2xl font-bold mb-6 text-white px-1">
                Configuración Avanzada: {tenant.name || slug}
            </h1>
            <TenantConfigPanel tenantSlug={slug} tenantDbName={tenant.dbName} />
        </div>
    );
}
