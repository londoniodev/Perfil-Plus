import { getSessionUser } from "@/lib/auth-server";
import { redirect, notFound } from "next/navigation";
import { serverFetch } from "@/lib/api-server";
import { Card } from "@alvarosky/ui";

interface Props {
    params: Promise<{ slug: string }>;
}

export default async function TenantDetailsPage({ params }: Props) {
    const user = await getSessionUser();
    if (!user || user.role !== "SUPERADMIN") redirect("/dashboard");

    const resolvedParams = await params;
    const slug = resolvedParams.slug;

    // Fetch via API to avoid direct DB dependency in the Dashboard app
    const allTenants = await serverFetch<any[]>('/tenant');
    const tenant = allTenants.find(t => t.slug === slug);

    if (!tenant) notFound();

    return (
        <div className="p-6 space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                 <h1 className="text-2xl font-bold text-white">Detalles: {tenant.name || slug}</h1>
            </div>
            <Card className="p-6 bg-slate-900 border-slate-800">
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <dt className="text-sm font-medium text-slate-400">ID de Sistema</dt>
                        <dd className="mt-1 text-sm text-white font-mono">{tenant.id}</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-slate-400">Identificador Único (Slug)</dt>
                        <dd className="mt-1 text-sm text-white font-mono">{tenant.slug}</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-slate-400">Estado de Cuenta</dt>
                        <dd className="mt-1 text-sm text-emerald-400 font-medium">{tenant.status}</dd>
                    </div>
                    <div>
                        <dt className="text-sm font-medium text-slate-400">Nombre de Base de Datos</dt>
                        <dd className="mt-1 text-sm text-white font-mono">{tenant.dbName}</dd>
                    </div>
                    {tenant.domain && (
                        <div>
                            <dt className="text-sm font-medium text-slate-400">Dominio Personalizado</dt>
                            <dd className="mt-1 text-sm text-blue-400 font-mono">{tenant.domain}</dd>
                        </div>
                    )}
                </dl>
            </Card>
        </div>
    );
}
