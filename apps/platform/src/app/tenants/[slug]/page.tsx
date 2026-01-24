import Link from "next/link";
import { notFound } from "next/navigation";
import { prismaManagement } from "@alvarosky/database-management";
import { Card, Badge } from "@alvarosky/ui";
import { TenantSettingsEditor } from "@/components/tenant-settings-editor";
import { LogoutButton } from "@/components/logout-button";
import { DatabaseSyncButton } from "@/components/database-sync-button";

export const dynamic = "force-dynamic";

interface Props {
    params: Promise<{ slug: string }>;
}

export default async function TenantDetailPage({ params }: Props) {
    const { slug } = await params;

    const tenant = await prismaManagement.tenant.findUnique({
        where: { slug },
    });

    if (!tenant) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
            {/* Background decoration */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-3xl" />
            </div>

            {/* Header */}
            <header className="relative border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-xl">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-white">Platform Admin</h1>
                                <p className="text-xs text-slate-400">Control Tower</p>
                            </div>
                        </Link>
                    </div>
                    <LogoutButton />
                </div>
            </header>

            {/* Main Content */}
            <main className="relative container mx-auto px-6 py-12">
                <Link href="/tenants" className="text-sm text-indigo-400 hover:text-indigo-300 mb-4 inline-flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Volver a Tenants
                </Link>

                {/* Tenant Header */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                        <span className="text-2xl font-bold text-indigo-400">
                            {(tenant.name || tenant.slug).charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-3xl font-bold text-white">{tenant.name || tenant.slug}</h2>
                            <Badge
                                className={
                                    tenant.status === "ACTIVE"
                                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                        : tenant.status === "DEPLOYING"
                                            ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                                            : "bg-red-500/20 text-red-400 border-red-500/30"
                                }
                            >
                                {tenant.status}
                            </Badge>
                        </div>
                        <p className="text-slate-400">
                            <span className="text-slate-500">Slug:</span> {tenant.slug}
                            <span className="mx-2 text-slate-700">•</span>
                            <span className="text-slate-500">DB:</span> {tenant.dbName}
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Info Card */}
                    <Card className="p-6 bg-slate-900/50 backdrop-blur border-slate-800/50">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Información
                        </h3>
                        <dl className="space-y-3 text-sm">
                            <div className="flex justify-between py-2 border-b border-slate-800">
                                <dt className="text-slate-400">Plan:</dt>
                                <dd className="font-medium text-white capitalize">{tenant.plan}</dd>
                            </div>
                            <div className="flex justify-between py-2 border-b border-slate-800">
                                <dt className="text-slate-400">Email:</dt>
                                <dd className="font-medium text-white">{tenant.ownerEmail || "—"}</dd>
                            </div>
                            <div className="flex justify-between py-2 border-b border-slate-800">
                                <dt className="text-slate-400">Base de Datos:</dt>
                                <dd className="font-mono text-xs text-indigo-400">{tenant.dbName}</dd>
                            </div>
                            <div className="flex justify-between py-2">
                                <dt className="text-slate-400">Creado:</dt>
                                <dd className="font-medium text-white">
                                    {new Date(tenant.createdAt).toLocaleDateString("es-CO", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                </dd>
                            </div>
                        </dl>
                    </Card>

                    {/* Settings Card */}
                    <Card className="p-6 bg-slate-900/50 backdrop-blur border-slate-800/50">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Configuración (SystemSettings)
                        </h3>
                        <TenantSettingsEditor tenantSlug={tenant.slug} tenantDbName={tenant.dbName} />
                    </Card>
                </div>

                {/* Maintenance Card */}
                <Card className="mt-6 p-6 bg-amber-500/5 border-amber-500/20">
                    <h3 className="text-lg font-semibold text-amber-400 mb-2 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Mantenimiento
                    </h3>
                    <p className="text-sm text-amber-300/70 mb-4">
                        Usa estas herramientas para reparar o sincronizar la base de datos del tenant.
                    </p>
                    <div className="max-w-md">
                        <DatabaseSyncButton tenantSlug={tenant.slug} />
                    </div>
                </Card>

                {/* Error Notes */}
                {tenant.notes && (
                    <Card className="mt-6 p-6 bg-slate-800/30 border-slate-700/50">
                        <h3 className="text-lg font-semibold text-slate-300 mb-2 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Notas / Logs
                        </h3>
                        <pre className="text-sm text-slate-400 whitespace-pre-wrap font-mono bg-slate-900/50 p-3 rounded-lg max-h-48 overflow-auto">{tenant.notes}</pre>
                    </Card>
                )}
            </main>
        </div>
    );
}
