import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth-server";
import { getTenantId } from "@/lib/config-server";
import { serverFetch } from "@/lib/api-server";
import { getDashboardStats, type DashboardStats } from "@/actions/admin/dashboard";
import { StatsCard } from "@/components/dashboard/stats-card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { TopProductsChart, type TopProductData } from "@/components/dashboard/top-products-chart";
import { OrderTypeChart, type OrderTypeData } from "@/components/dashboard/order-type-chart";
import { ProductionByProductTable } from "@/components/dashboard/production-by-product-table";
import { MarginCostChart } from "@/components/dashboard/margin-cost-chart";

// ---- ... [Skipped lines]

{
    hasRestaurant && (
        <div className="space-y-4 pt-4">
            <h2 className="text-xl font-bold tracking-tight">Métricas Operativas (Restaurante)</h2>

            {/* Fila 1: Top Productos (2 columnas) y Distribuciones (1 columna apilada) */}
            <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-3">
                <div className="lg:col-span-2 flex flex-col h-full">
                    <TopProductsChart data={mappedTopProducts} />
                </div>
                <div className="lg:col-span-1 flex flex-col gap-4 sm:gap-6 h-full">
                    <div className="flex-1">
                        <OrderTypeChart data={mappedOrderTypes} />
                    </div>
                    <div className="flex-1">
                        <PaymentMethodsChart data={mappedPaymentMethods} />
                    </div>
                </div>
            </div>

            {/* Fila 2: Tiempos agrupados (1 columna flotante si se quiere, o mitad) */}
            <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2 mt-4 sm:mt-6">
                <ProductionTimeChart data={mappedProductionTimes} />
                <ProductionByProductTable data={stats.productionTimesByProduct || []} />
            </div>
        </div>
    )
}

{
    hasRestaurant && (
        <div className="space-y-4 pt-4">
            <h2 className="text-xl font-bold tracking-tight">Finanzas y Costeo</h2>
            <CostingSummaryCards tenantId={tenant.id} />
            <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-1">
                <MarginCostChart tenantId={tenant.id} />
            </div>
        </div>
    )
}

{/* Quick Actions removed per user request */ }
        </>
    );
}

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function AdminDashboardPage(props: PageProps) {
    const searchParams = await props.searchParams;
    const user = await getSessionUser();

    if (!user) {
        redirect("/login?redirect=/admin");
    }

    if (user.role !== "ADMIN") {
        redirect("/perfil");
    }

    const tenant = await getTenantData();
    const period = (searchParams.period as string) || "30d";
    const isFirstTime = !tenant.features || tenant.features.length === 0;

    const currentDate = new Date().toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <div className="flex flex-col min-h-screen relative">
            <div className="flex-1 px-4 sm:px-6 py-6 sm:py-8 lg:py-10">
                <div className="max-w-7xl mx-auto space-y-10">

                    {/* Welcome Card */}
                    <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 shadow-sm overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-32 bg-primary/10 rounded-full blur-[100px] -mr-16 -mt-16 pointer-events-none" />
                        <div className="absolute bottom-0 left-0 p-32 bg-primary/5 rounded-full blur-[100px] -ml-16 -mb-16 pointer-events-none" />

                        <CardContent className="p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                            <div>
                                <h1 className="text-4xl font-extrabold tracking-tight mb-2">
                                    Hola, <span className="text-primary">{user.name || "Admin"}</span> 👋
                                </h1>
                                <p className="text-muted-foreground capitalize font-medium text-lg">
                                    {currentDate}
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0 items-end">
                                <DashboardTimeSelector currentPeriod={period} />
                            </div>
                        </CardContent>
                    </Card>

                    {isFirstTime ? (
                        /* Empty State - First Time Setup */
                        <Card className="border-dashed">
                            <CardContent className="flex flex-col items-center justify-center py-16 px-4">
                                <div className="rounded-full bg-primary/10 p-4 mb-4">
                                    <Sparkles className="h-12 w-12 text-primary" />
                                </div>
                                <h2 className="text-2xl font-bold mb-2">
                                    ¡Bienvenido a tu Panel de Administración!
                                </h2>
                                <p className="text-muted-foreground text-center mb-6 max-w-md">
                                    Tu plataforma está lista. Configura las funcionalidades que necesitas para comenzar a gestionar tu negocio.
                                </p>
                                <Button size="lg" asChild>
                                    <Link href="/configuracion">
                                        <Settings className="mr-2 h-5 w-5" />
                                        Configurar mi Negocio
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <Suspense key={period} fallback={<DashboardSkeleton />}>
                            <DashboardMetrics tenant={tenant} period={period} />
                        </Suspense>
                    )}
                </div>
            </div>
        </div>
    );
}
