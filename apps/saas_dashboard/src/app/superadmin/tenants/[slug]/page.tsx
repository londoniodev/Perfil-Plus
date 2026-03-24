import { getSessionUser } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { prisma } from "@alvarosky/database";
import { Card } from "@alvarosky/ui";

interface Props {
    params: Promise<{ slug: string }>;
}

export default async function TenantDetailsPage({ params }: Props) {
    const user = await getSessionUser();
    if (!user || user.role !== "SUPERADMIN") redirect("/dashboard");

    const resolvedParams = await params;
    const slug = resolvedParams.slug;

    const tenant = await prisma.tenant.findUnique({ where: { slug } });

    if (!tenant) return <div className="p-8 text-white">Tenant no encontrado (Error 404)</div>;

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
                </dl>
            </Card>
        </div>
    );
}
