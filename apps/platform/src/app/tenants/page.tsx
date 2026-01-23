import Link from "next/link";
import { prismaManagement } from "@alvarosky/database-management";
import { Card, Button, Badge } from "@alvarosky/ui";
import { LogoutButton } from "@/components/logout-button";

export const dynamic = "force-dynamic";

export default async function TenantsPage() {
    const tenants = await prismaManagement.tenant.findMany({
        orderBy: { createdAt: "desc" },
    });

    const activeCount = tenants.filter(t => t.status === "ACTIVE").length;

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
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <Link href="/" className="text-sm text-indigo-400 hover:text-indigo-300 mb-2 inline-flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Volver al Dashboard
                        </Link>
                        <h2 className="text-3xl font-bold text-white">Tenants</h2>
                        <p className="text-slate-400 mt-1">
                            {activeCount} activo{activeCount !== 1 ? "s" : ""} de {tenants.length} total
                        </p>
                    </div>
                    <Link href="/tenants/new">
                        <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500">
                            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Nuevo Tenant
                        </Button>
                    </Link>
                </div>

                {/* Tenants List */}
                {tenants.length === 0 ? (
                    <Card className="p-12 bg-slate-900/50 backdrop-blur border-slate-800/50 text-center">
                        <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <p className="text-slate-400 mb-4">No hay tenants creados aún</p>
                        <Link href="/tenants/new">
                            <Button className="bg-gradient-to-r from-indigo-600 to-purple-600">
                                Crear primer tenant
                            </Button>
                        </Link>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {tenants.map((tenant) => (
                            <Link key={tenant.id} href={`/tenants/${tenant.slug}`} className="group">
                                <Card className="p-5 bg-slate-900/50 backdrop-blur border-slate-800/50 hover:border-indigo-500/50 hover:bg-slate-800/50 transition-all">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                                                <span className="text-lg font-bold text-indigo-400">
                                                    {tenant.name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-white group-hover:text-indigo-300 transition-colors">
                                                    {tenant.name}
                                                </h3>
                                                <p className="text-sm text-slate-400">
                                                    <span className="text-slate-500">Slug:</span> {tenant.slug}
                                                    <span className="mx-2 text-slate-700">•</span>
                                                    <span className="text-slate-500">DB:</span> {tenant.dbName}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <Badge
                                                variant={
                                                    tenant.status === "ACTIVE"
                                                        ? "default"
                                                        : tenant.status === "DEPLOYING"
                                                            ? "secondary"
                                                            : "destructive"
                                                }
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
                                            <svg className="w-5 h-5 text-slate-600 group-hover:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
