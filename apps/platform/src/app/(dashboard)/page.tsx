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
        <div className="min-h-[calc(100vh-4rem)] flex flex-col gap-6">
            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-3">
                <Link href="/tenants">
                    <Card className="p-6 bg-card hover:bg-accent/50 transition-colors cursor-pointer border-border">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-foreground">
                                    {stats.error ? "—" : stats.activeTenants}
                                </p>
                                <p className="text-sm text-muted-foreground">Tenants Activos</p>
                                {!stats.error && stats.totalTenants > 0 && (
                                    <p className="text-xs text-muted-foreground/80">de {stats.totalTenants} total</p>
                                )}
                            </div>
                        </div>
                    </Card>
                </Link>

                <Card className="p-6 bg-card border-border">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stats.dbConnected ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
                            <svg className={`w-6 h-6 ${stats.dbConnected ? "text-emerald-500" : "text-red-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {stats.dbConnected ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                )}
                            </svg>
                        </div>
                        <div>
                            <p className={`text-2xl font-bold ${stats.dbConnected ? "text-emerald-500" : "text-red-500"}`}>
                                {stats.dbConnected ? "Online" : "Error"}
                            </p>
                            <p className="text-sm text-muted-foreground">Conexión a DB</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 bg-card border-border">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stats.error ? "bg-amber-500/10" : "bg-emerald-500/10"}`}>
                            <svg className={`w-6 h-6 ${stats.error ? "text-amber-500" : "text-emerald-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                            </svg>
                        </div>
                        <div>
                            <p className={`text-2xl font-bold ${stats.error ? "text-amber-500" : "text-foreground"}`}>
                                {stats.error ? "Migrar" : "OK"}
                            </p>
                            <p className="text-sm text-muted-foreground">Schema Prisma</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Quick Actions */}
            <div>
                <h3 className="text-xl font-semibold text-foreground mb-4">Acciones Rápidas</h3>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Link href="/tenants/new" className="group">
                        <Card className="p-6 bg-card hover:bg-accent/50 border-border hover:border-primary/50 transition-all h-full">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                </div>
                            </div>
                            <h4 className="text-lg font-semibold text-foreground mb-1">Crear Tenant</h4>
                            <p className="text-sm text-muted-foreground">
                                Provisionar nueva base de datos de cliente
                            </p>
                        </Card>
                    </Link>
                </div>
            </div>
        </div>
    );
}
