import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth-server";
import { getTenantId } from "@/lib/config-server";
import { serverFetch } from "@/lib/api-server";
import { getDashboardStats, type DashboardStats } from "@/actions/admin/dashboard";
import { StatsCard } from "@/components/dashboard/stats-card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { TopProductsChart, type TopProductData } from "@/components/dashboard/top-products-chart";
import { OrderTypeChart, type OrderTypeData } from "@/components/dashboard/order-type-chart";
import { RecentOrdersTable, type RecentOrderData } from "@/components/dashboard/recent-orders-table";
import { PaymentMethodsChart, type PaymentMethodData } from "@/components/dashboard/payment-methods-chart";
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

function formatTrend(percent: number | null): { text: string; up: boolean } | null {
    if (percent === null) return null;
    const sign = percent >= 0 ? "+" : "";
    return { text: `${sign}${percent}%`, up: percent >= 0 };
}

export default async function AdminDashboardPage() {
    const user = await getSessionUser();

    if (!user) {
        redirect("/login?redirect=/admin");
    }

    if (user.role !== "ADMIN") {
        redirect("/perfil");
    }

    const tenantId = await getTenantId();
    const tenant = await getTenantData();
    const stats = await getDashboardStats(tenant.features || []);

    // Check if this is first-time setup (no features enabled)
    const isFirstTime = !tenant.features || tenant.features.length === 0;

    const currentDate = new Date().toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    const hasLMS = tenant.features?.includes("lms");
    const hasShop = tenant.features?.includes("shop");
    const hasBlog = tenant.features?.includes("blog");
    const hasRestaurant = tenant.features?.includes("restaurant");

    const userTrend = formatTrend(stats.userGrowthPercent);
    const revTrend = formatTrend(stats.revenueGrowthPercent);

    // --- Mock Data for Restaurant Dashboard ---
    const mockTopProducts: TopProductData[] = [
        { name: "Bandeja Paisa", cantidad: 145, ingresos: 3625000 },
        { name: "Sancocho de Gallina", cantidad: 98, ingresos: 2156000 },
        { name: "Limonada Natural", cantidad: 210, ingresos: 1260000 },
        { name: "Ajiaco Santafereño", cantidad: 85, ingresos: 2210000 },
        { name: "Postre de Natas", cantidad: 64, ingresos: 512000 },
    ];

    const mockOrderTypes: OrderTypeData[] = [
        { type: "DINE_IN", label: "Mesa", count: 342, fill: "var(--color-DINE_IN)" },
        { type: "TAKE_AWAY", label: "Llevar", count: 128, fill: "var(--color-TAKE_AWAY)" },
        { type: "DELIVERY", label: "Domicilio", count: 215, fill: "var(--color-DELIVERY)" },
    ];

    const mockPaymentMethods: PaymentMethodData[] = [
        { method: "CASH", label: "Efectivo", total: 4500000, count: 185 },
        { method: "CARD", label: "Tarjeta", total: 8200000, count: 240 },
        { method: "TRANSFER", label: "Transferencia", total: 3100000, count: 110 },
        { method: "OTHER", label: "Otros", total: 450000, count: 20 },
    ];

    const mockRecentOrders: RecentOrderData[] = [
        {
            id: "1",
            orderNumber: "00142",
            customerName: "Carlos Rodríguez",
            totalAmount: 45000,
            status: "DELIVERED",
            orderType: "DINE_IN",
            tableNumber: "1",
            createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
            itemCount: 2,
        },
        {
            id: "2",
            orderNumber: "00143",
            customerName: "María Gómez",
            totalAmount: 125000,
            status: "SERVED",
            orderType: "DINE_IN",
            tableNumber: "4",
            createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
            itemCount: 4,
        },
        {
            id: "3",
            orderNumber: "00144",
            customerName: "Juan Pérez",
            totalAmount: 68000,
            status: "PREPARING",
            orderType: "DELIVERY",
            tableNumber: null,
            createdAt: new Date(Date.now() - 1000 * 60 * 22).toISOString(),
            itemCount: 3,
        },
        {
            id: "4",
            orderNumber: "00145",
            customerName: null,
            totalAmount: 35000,
            status: "PENDING",
            orderType: "TAKE_AWAY",
            tableNumber: null,
            createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
            itemCount: 1,
        },
    ];

    return (
        <div className="flex flex-col min-h-screen relative">
            {/* Header - Now part of content for better Card styling */}
            <div className="flex-1 px-4 sm:px-6 py-6 sm:py-8 lg:py-10">
                <div className="max-w-7xl mx-auto space-y-10">

                    {/* Welcome Card */}
                    <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 shadow-sm overflow-hidden relative">
                        {/* Decorative Background Mesh */}
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
                            <Button variant="outline" size="lg" className="h-12 px-6 border-primary/20 hover:bg-primary/5" asChild>
                                <Link href="/configuracion">
                                    <Settings className="mr-2 h-5 w-5" />
                                    Configuración
                                </Link>
                            </Button>
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
                        <>
                            {/* Stats Grid */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold tracking-tight">Resumen General</h2>
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
                                                title="Ingresos del Mes"
                                                value={formatCurrency(stats.totalRevenueThisMonth)}
                                                icon={DollarSign}
                                                trend={revTrend?.text}
                                                trendUp={revTrend?.up}
                                            />
                                            <StatsCard
                                                title="Pedidos Pendientes"
                                                value={stats.pendingOrders.toLocaleString("es-ES")}
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
                                            {stats.topProductToday && (
                                                <StatsCard
                                                    title="Plato Más Vendido Hoy"
                                                    value={stats.topProductToday}
                                                    icon={ChefHat}
                                                />
                                            )}
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
                                <div className="space-y-4">
                                    <h2 className="text-xl font-bold tracking-tight">Métricas de Restaurante (Demo)</h2>
                                    <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
                                        <TopProductsChart data={mockTopProducts} />
                                        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
                                            <OrderTypeChart data={mockOrderTypes} />
                                            <PaymentMethodsChart data={mockPaymentMethods} />
                                        </div>
                                    </div>
                                    <RecentOrdersTable data={mockRecentOrders} />
                                </div>
                            )}

                            {/* Quick Actions */}
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold tracking-tight">Accesos Rápidos</h2>
                                <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                                    {hasLMS && (
                                        <Link href="/academia/cursos" className="group relative overflow-hidden rounded-xl border border-border/50 bg-card/40 p-6 hover:bg-card/80 hover:shadow-md transition-all duration-300">
                                            <div className="flex items-start gap-4">
                                                <div className="rounded-xl bg-primary/10 p-3 text-primary ring-1 ring-primary/20 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                                                    <BookOpen className="h-6 w-6" />
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="font-semibold leading-none tracking-tight">Gestionar Cursos</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        Crea y edita contenido educativo
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    )}

                                    {hasShop && (
                                        <Link href="/tienda/productos" className="group relative overflow-hidden rounded-xl border border-border/50 bg-card/40 p-6 hover:bg-card/80 hover:shadow-md transition-all duration-300">
                                            <div className="flex items-start gap-4">
                                                <div className="rounded-xl bg-primary/10 p-3 text-primary ring-1 ring-primary/20 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                                                    <ShoppingCart className="h-6 w-6" />
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="font-semibold leading-none tracking-tight">Gestionar Productos</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        Controla tu inventario y precios
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    )}

                                    {hasRestaurant && (
                                        <>
                                            <Link href="/restaurante/pos" className="group relative overflow-hidden rounded-xl border border-border/50 bg-card/40 p-6 hover:bg-card/80 hover:shadow-md transition-all duration-300">
                                                <div className="flex items-start gap-4">
                                                    <div className="rounded-xl bg-primary/10 p-3 text-primary ring-1 ring-primary/20 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                                                        <UtensilsCrossed className="h-6 w-6" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="font-semibold leading-none tracking-tight">Punto de Venta</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            Abre el POS para tomar pedidos
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>

                                            <Link href="/restaurante/comandas" className="group relative overflow-hidden rounded-xl border border-border/50 bg-card/40 p-6 hover:bg-card/80 hover:shadow-md transition-all duration-300">
                                                <div className="flex items-start gap-4">
                                                    <div className="rounded-xl bg-primary/10 p-3 text-primary ring-1 ring-primary/20 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                                                        <ChefHat className="h-6 w-6" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="font-semibold leading-none tracking-tight">Cocina / Comandas</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            Gestiona las órdenes en la cocina
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        </>
                                    )}

                                    <Link href="/usuarios" className="group relative overflow-hidden rounded-xl border border-border/50 bg-card/40 p-6 hover:bg-card/80 hover:shadow-md transition-all duration-300">
                                        <div className="flex items-start gap-4">
                                            <div className="rounded-xl bg-primary/10 p-3 text-primary ring-1 ring-primary/20 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                                                <Users className="h-6 w-6" />
                                            </div>
                                            <div className="space-y-1">
                                                <div className="font-semibold leading-none tracking-tight">Gestionar Usuarios</div>
                                                <div className="text-sm text-muted-foreground">
                                                    Administra roles y permisos
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
