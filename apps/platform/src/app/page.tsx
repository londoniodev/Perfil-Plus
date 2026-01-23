import Link from "next/link";
import { Card } from "@alvarosky/ui";
import { LogoutButton } from "@/components/logout-button";
import { prismaManagement } from "@alvarosky/database-management";

export const dynamic = "force-dynamic";

async function getStats() {
    try {
        const [tenants, activeCount] = await Promise.all([
            prismaManagement.tenant.count(),
            prismaManagement.tenant.count({ where: { status: "ACTIVE" } }),
        ]);
        return { totalTenants: tenants, activeTenants: activeCount, dbConnected: true, error: null };
    } catch (error) {
        console.error("Error fetching stats:", error);
        // Check if it's a schema error (table doesn't exist)
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        const isSchemaError = errorMessage.includes("does not exist");
        return {
            totalTenants: 0,
            activeTenants: 0,
            dbConnected: !isSchemaError,
            error: isSchemaError ? "Schema no migrado" : "Error de conexión"
        };
    }
}

export default async function HomePage() {
    const stats = await getStats();

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
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white">Platform Admin</h1>
                            <p className="text-xs text-slate-400">Control Tower</p>
                        </div>
                    </div>
                    <LogoutButton />
                </div>
            </header>

            {/* Main Content */}
            <main className="relative container mx-auto px-6 py-12">
                {/* Schema Warning */}
                {stats.error && (
                    <div className="mb-8 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                        <div className="flex items-start gap-3">
                            <svg className="w-6 h-6 text-amber-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <div>
                                <h3 className="font-semibold text-amber-400">⚠️ {stats.error}</h3>
                                <p className="text-sm text-amber-300/80 mt-1">
                                    Las tablas de gestión no existen en la base de datos. Ejecuta este comando en el servidor:
                                </p>
                                <code className="block mt-2 p-2 bg-slate-900 rounded text-xs text-amber-200 font-mono">
                                    cd packages/database-management && DATABASE_URL="tu_connection_string" npx prisma db push
                                </code>
                            </div>
                        </div>
                    </div>
                )}

                {/* Welcome Section */}
                <div className="mb-12">
                    <h2 className="text-3xl font-bold text-white mb-2">
                        Bienvenido, Admin 👋
                    </h2>
                    <p className="text-slate-400">
                        Gestiona tus tenants y configuraciones desde aquí.
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-6 md:grid-cols-3 mb-12">
                    <Link href="/tenants">
                        <Card className="p-6 bg-slate-900/50 backdrop-blur border-slate-800/50 hover:border-indigo-500/50 transition-colors cursor-pointer">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">
                                        {stats.error ? "—" : stats.activeTenants}
                                    </p>
                                    <p className="text-sm text-slate-400">Tenants Activos</p>
                                    {!stats.error && stats.totalTenants > 0 && (
                                        <p className="text-xs text-slate-500">de {stats.totalTenants} total</p>
                                    )}
                                </div>
                            </div>
                        </Card>
                    </Link>

                    <Card className="p-6 bg-slate-900/50 backdrop-blur border-slate-800/50 hover:border-emerald-500/50 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stats.dbConnected ? "bg-emerald-500/20" : "bg-red-500/20"}`}>
                                <svg className={`w-6 h-6 ${stats.dbConnected ? "text-emerald-400" : "text-red-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    {stats.dbConnected ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    )}
                                </svg>
                            </div>
                            <div>
                                <p className={`text-2xl font-bold ${stats.dbConnected ? "text-emerald-400" : "text-red-400"}`}>
                                    {stats.dbConnected ? "Online" : "Error"}
                                </p>
                                <p className="text-sm text-slate-400">Conexión a DB</p>
                                {!stats.dbConnected && (
                                    <p className="text-xs text-red-400/80">Revisar configuración</p>
                                )}
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 bg-slate-900/50 backdrop-blur border-slate-800/50 hover:border-amber-500/50 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stats.error ? "bg-amber-500/20" : "bg-emerald-500/20"}`}>
                                <svg className={`w-6 h-6 ${stats.error ? "text-amber-400" : "text-emerald-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                                </svg>
                            </div>
                            <div>
                                <p className={`text-2xl font-bold ${stats.error ? "text-amber-400" : "text-white"}`}>
                                    {stats.error ? "Migrar" : "OK"}
                                </p>
                                <p className="text-sm text-slate-400">Schema Prisma</p>
                                {stats.error && (
                                    <p className="text-xs text-amber-400/80">Ejecutar db push</p>
                                )}
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Quick Actions */}
                <h3 className="text-xl font-semibold text-white mb-6">Acciones Rápidas</h3>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Link href="/tenants" className="group">
                        <Card className="p-6 bg-slate-900/50 backdrop-blur border-slate-800/50 hover:border-indigo-500/50 hover:bg-slate-800/50 transition-all h-full">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <svg className="w-5 h-5 text-slate-600 group-hover:text-indigo-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                            <h4 className="text-lg font-semibold text-white mb-1">Ver Tenants</h4>
                            <p className="text-sm text-slate-400">
                                Gestiona los clientes y sus bases de datos
                            </p>
                        </Card>
                    </Link>

                    <Link href="/tenants/new" className="group">
                        <Card className="p-6 bg-slate-900/50 backdrop-blur border-slate-800/50 hover:border-emerald-500/50 hover:bg-slate-800/50 transition-all h-full">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                </div>
                                <svg className="w-5 h-5 text-slate-600 group-hover:text-emerald-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                            <h4 className="text-lg font-semibold text-white mb-1">Crear Tenant</h4>
                            <p className="text-sm text-slate-400">
                                Provisionar nueva base de datos de cliente
                            </p>
                        </Card>
                    </Link>

                    <Card className="p-6 bg-slate-900/30 backdrop-blur border-slate-800/30 opacity-60 cursor-not-allowed h-full">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-slate-700/50 flex items-center justify-center">
                                <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                        </div>
                        <h4 className="text-lg font-semibold text-slate-500 mb-1">Configuración</h4>
                        <p className="text-sm text-slate-600">
                            Próximamente
                        </p>
                    </Card>
                </div>
            </main>
        </div>
    );
}
