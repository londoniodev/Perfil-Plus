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
import { PaymentMethodsChart, type PaymentMethodData } from "@/components/dashboard/payment-methods-chart";
import { ProductionTimeChart, type ProductionTimeData } from "@/components/dashboard/production-time-chart";
import { ProductionByProductTable } from "@/components/dashboard/production-by-product-table";
import { MarginCostChart } from "@/components/dashboard/margin-cost-chart";
import { CostingSummaryCards } from "@/components/dashboard/costing-summary-cards";
import { DashboardTimeSelector } from "@/components/dashboard/dashboard-time-selector";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Separator } from "@alvarosky/ui";
import {
    Users,
    ShoppingCart,
    BookOpen,
    TrendingUp,
    Package,
    DollarSign,
    GraduationCap,
    Settings,
    Sparkles,
    UtensilsCrossed,
    ChefHat,
    Timer,
    Percent,
} from "lucide-react";
import Link from "next/link";

async function getTenantData() {
    try {
        const tenant = await serverFetch<any>('/tenant/branding');
        return tenant || { features: [], design: null, name: null };
    } catch (e) {
        console.error("Error fetching tenant config:", e);
        return { features: [], design: null, name: null };
    }
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

function formatTrend(percent: number | null | undefined): { text: string; up: boolean } | null {
    if (percent === null || percent === undefined || Number.isNaN(percent)) return null;
    const sign = percent >= 0 ? "+" : "";
    return { text: `${sign}${percent}%`, up: percent >= 0 };
}

function DashboardSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="h-8 w-48 bg-card/60 rounded-md border border-border/50" />
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-[120px] rounded-xl bg-card/60 border border-border/50" />
                ))}
            </div>
            <div className="h-[350px] rounded-xl bg-card/60 border border-border/50" />
            <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
                <div className="h-[350px] rounded-xl bg-card/60 border border-border/50" />
                <div className="h-[350px] rounded-xl bg-card/60 border border-border/50" />
            </div>
        </div>
    );
}

// Extracted metrics component to allow Suspense streaming
async function DashboardMetrics({ tenant, period }: { tenant: any, period: string }) {
    const stats = await getDashboardStats(tenant.features || [], period);

    const mappedTopProducts: TopProductData[] = (stats.topProducts || []).map(p => ({
        name: p.productName,
        cantidad: p.quantity,
        ingresos: 0 // Simplificado
    }));

    const mappedOrderTypes: OrderTypeData[] = (stats.orderTypes || []).map((ot) => ({
        type: ot.type,
        label: ot.type === 'DINE_IN' ? 'Mesa' : ot.type === 'DELIVERY' ? 'Domicilio' : 'Llevar',
        count: ot.count,
        total: ot.total || 0,
        fill: ot.type === 'DINE_IN' ? 'var(--color-DINE_IN)' : ot.type === 'DELIVERY' ? 'var(--color-DELIVERY)' : 'var(--color-TAKE_AWAY)'
    }));

    const mappedPaymentMethods: PaymentMethodData[] = (stats.paymentMethods || []).map(pm => ({
        method: pm.method,
        label: pm.method === 'CASH' ? 'Efectivo' : 'Tarjeta/Transferencia',
        count: pm.count,
        total: pm.total || 0 // Properly mapped from backend
    }));

    const mappedProductionTimes: ProductionTimeData[] = (stats.productionTimes || []).map(p => ({
        step: p.stage === 'Preparation' ? 'Preparación' : p.stage === 'Shipping' ? 'Embalaje/Envío' : 'Entrega',
        time: p.minutes
    }));



    const hasLMS = tenant.features?.includes("lms");
    const hasShop = tenant.features?.includes("shop");
    const hasBlog = tenant.features?.includes("blog");
    const hasRestaurant = tenant.features?.includes("restaurant");

    const userTrend = formatTrend(stats.userGrowthPercent);
    const revTrend = formatTrend(stats.revenueGrowthPercent);

    // Cleaned up unused mock recent orders.

    return (
        <>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold tracking-tight">Período Actual</h2>
                </div>
                <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Usuarios totales */}
                    <StatsCard
                        title="Usuarios Totales"
                        value={stats.totalUsers.toLocaleString("es-ES")}
                        icon={Users}
                        trend={userTrend?.text}
                        trendUp={userTrend?.up}
                    />

                    {/* Revenue - Shop o Restaurant */}
                    {(hasShop || hasRestaurant) && (
                        <>
                            <StatsCard
                                title="Ingresos"
                                value={formatCurrency(stats.periodRevenue || 0)}
                                icon={DollarSign}
                                trend={revTrend?.text}
                                trendUp={revTrend?.up}
                            />
                            <StatsCard
                                title="Órdenes Recibidas"
                                value={(stats.periodOrdersCount || 0).toLocaleString("es-ES")}
                                icon={Package}
                            />
                        </>
                    )}

                    {/* Blog Stats */}
                    {hasBlog && (
                        <StatsCard
                            title="Artículos Publicados"
                            value={stats.publishedPosts.toLocaleString("es-ES")}
                            icon={BookOpen}
                        />
                    )}

                    {/* LMS Stats */}
                    {hasLMS && (
                        <>
                            <StatsCard
                                title="Temas Publicados"
                                value={stats.publishedThemes.toLocaleString("es-ES")}
                                icon={GraduationCap}
                            />
                            <StatsCard
                                title="Lecciones Activas"
                                value={stats.totalLessons.toLocaleString("es-ES")}
                                icon={BookOpen}
                            />
                        </>
                    )}

                    {/* Restaurant Stats */}
                    {hasRestaurant && (
                        <>
                            <StatsCard
                                title="Órdenes Hoy"
                                value={stats.restaurantOrdersToday.toLocaleString("es-ES")}
                                icon={UtensilsCrossed}
                            />
                            {/* Plato Más Vendido Hoy card removed per user request */}
                        </>
                    )}
                </div>
            </div>

            <Separator className="opacity-50" />

            {/* Revenue Chart - shadcn/recharts */}
            {(hasShop || hasRestaurant) && (
                <div className="space-y-4">
                    <h2 className="text-xl font-bold tracking-tight">Análisis de Rendimiento</h2>
                    <RevenueChart data={stats.revenueByDay} />
                </div>
            )}

            {hasRestaurant && (
                <div className="space-y-4 pt-4">
                    <h2 className="text-xl font-bold tracking-tight">Métricas Operativas (Restaurante)</h2>

                    {/* Fila 1: Tipos de Orden, Métodos de Pago y Tiempos de Entrega */}
                    <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-3">
                        <OrderTypeChart data={mappedOrderTypes} />
                        <PaymentMethodsChart data={mappedPaymentMethods} />
                        <ProductionTimeChart data={mappedProductionTimes} />
                    </div>

                    {/* Fila 2: Productos Más Vendidos */}
                    <div className="grid gap-4 sm:gap-6 grid-cols-1 mt-4 sm:mt-6">
                        <TopProductsChart data={mappedTopProducts} />
                    </div>

                    {/* Fila 3: Tiempos de Producción por Producto */}
                    <div className="grid gap-4 sm:gap-6 grid-cols-1 mt-4 sm:mt-6">
                        <ProductionByProductTable data={stats.productionTimesByProduct || []} />
                    </div>
                </div>
            )}

            {hasRestaurant && (
                <div className="space-y-4 pt-4">
                    <h2 className="text-xl font-bold tracking-tight">Finanzas y Costeo</h2>
                    <CostingSummaryCards tenantId={tenant.id} />
                    <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-1">
                        <MarginCostChart tenantId={tenant.id} />
                    </div>
                </div>
            )}

            {/* Quick Actions removed per user request */}
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
