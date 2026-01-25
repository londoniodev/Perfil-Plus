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
        <div className="container mx-auto py-8 space-y-8">
            {/* Header Section could go here if needed, but layout handles 'Platform' title */}

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Link href="/tenants">
                    <Card className="p-6 bg-card hover:bg-accent/50 transition-all duration-200 cursor-pointer border-border hover:shadow-lg hover:border-primary/20 group h-full">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                                <svg className="w-6 h-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-foreground tracking-tight">
                                    {stats.error ? "—" : stats.activeTenants}
                                </p>
                                <p className="text-sm text-muted-foreground font-medium">Tenants Activos</p>
                                {!stats.error && stats.totalTenants > 0 && (
                                    <p className="text-xs text-muted-foreground/60 mt-1">de {stats.totalTenants} registrados</p>
                                )}
                            </div>
                        </div>
                    </Card>
                </Link>

                <Card className="p-6 bg-card border-border h-full">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${stats.dbConnected ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
                            <svg className={`w-6 h-6 ${stats.dbConnected ? "text-emerald-500" : "text-red-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {stats.dbConnected ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                )}
                            </svg>
                        </div>
                        <div>
                            <p className={`text-3xl font-bold tracking-tight ${stats.dbConnected ? "text-emerald-500" : "text-red-500"}`}>
                                {stats.dbConnected ? "Online" : "Error"}
                            </p>
                            <p className="text-sm text-muted-foreground font-medium">Base de Datos</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 bg-card border-border h-full">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${stats.error ? "bg-amber-500/10" : "bg-emerald-500/10"}`}>
                            <svg className={`w-6 h-6 ${stats.error ? "text-amber-500" : "text-emerald-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                            </svg>
                        </div>
                        <div>
                            <p className={`text-3xl font-bold tracking-tight ${stats.error ? "text-amber-500" : "text-foreground"}`}>
                                {stats.error ? "Revisar" : "Sincronizado"}
                            </p>
                            <p className="text-sm text-muted-foreground font-medium">Schema Prisma</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Acciones Rápidas
                </h3>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Link href="/tenants/new" className="group">
                        <Card className="p-6 bg-card hover:bg-accent/50 border-border hover:border-primary/50 transition-all duration-200 h-full hover:shadow-md">
                            <div className="flex flex-col gap-4">
                                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                    <svg className="w-6 h-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">Crear Tenant</h4>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        Provisionar nueva base de datos y cliente automáticamente.
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </Link>
                </div>
            </div>
        </div>
    );
}
