import { TenantConfigPanel } from "@/components/superadmin/tenant-config-panel";
import { getSessionUser } from "@/lib/auth-server";
import { redirect, notFound } from "next/navigation";
import { serverFetch } from "@/lib/api-server";

interface Props {
    params: Promise<{ slug: string }>;
}

export default async function TenantSettingsPage({ params }: Props) {
    const user = await getSessionUser();
    if (!user || user.role !== "SUPERADMIN") redirect("/dashboard");

    const resolvedParams = await params;
    const slug = resolvedParams.slug;

    // Fetch via API to avoid direct DB dependency in the Dashboard app
    const allTenants = await serverFetch<any[]>('/tenant');
    const tenant = allTenants.find(t => t.slug === slug);

    if (!tenant) notFound();

    return (
        <div className="p-4 sm:p-6 w-full">
            <h1 className="text-2xl font-bold mb-6 text-white px-1">
                Configuración Avanzada: {tenant.name || slug}
            </h1>
            <TenantConfigPanel tenantSlug={slug} tenantDbName={tenant.dbName} />
        </div>
    );
}
