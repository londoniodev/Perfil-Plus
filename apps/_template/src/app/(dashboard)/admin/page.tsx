import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth-server";
import { PrismaClient } from "@alvarosky/database-management";
import { getTenantId } from "@/lib/config-server";
import { getDashboardStats, type DashboardStats } from "@/actions/admin/dashboard";
import { StatsCard } from "@/components/dashboard/stats-card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
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
} from "lucide-react";
import Link from "next/link";

const prisma = new PrismaClient();

async function getTenantData(tenantId: string) {
    try {
        const tenant = await prisma.tenant.findUnique({
            where: { slug: tenantId },
            select: {
                features: true,
                design: true,
                name: true,
            }
        });
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
    const tenant = await getTenantData(tenantId);
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

    return (
        <div className="flex flex-col min-h-screen">
            {/* Header - Now part of content for better Card styling */}
            <div className="flex-1 px-6 py-8">
                <div className="max-w-7xl space-y-8">

                    {/* Welcome Card */}
                    <Card className="bg-card border-border overflow-hidden relative">
                        {/* Optional: Add a subtle gradient or pattern overlay if desired, keeping it simple for now matching request */}
                        <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

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
                                <Link href="/admin/settings">
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
                                    <Link href="/admin/settings">
                                        <Settings className="mr-2 h-5 w-5" />
                                        Configurar mi Negocio
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            {/* Stats Grid */}
                            <div>
                                <h2 className="text-lg font-semibold mb-4">Resumen General</h2>
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

                            <Separator />

                            {/* Revenue Chart - shadcn/recharts */}
                            {(hasShop || hasRestaurant) && (
                                <div>
                                    <h2 className="text-lg font-semibold mb-4">Análisis de Rendimiento</h2>
                                    <RevenueChart data={stats.revenueByDay} />
                                </div>
                            )}

                            {/* Quick Actions */}
                            <div>
                                <h2 className="text-lg font-semibold mb-4">Accesos Rápidos</h2>
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {hasLMS && (
                                        <Button variant="outline" className="h-auto py-4 justify-start" asChild>
                                            <Link href="/admin/cursos">
                                                <BookOpen className="mr-3 h-5 w-5" />
                                                <div className="text-left">
                                                    <div className="font-semibold">Gestionar Cursos</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        Crea y edita contenido educativo
                                                    </div>
                                                </div>
                                            </Link>
                                        </Button>
                                    )}

                                    {hasShop && (
                                        <Button variant="outline" className="h-auto py-4 justify-start" asChild>
                                            <Link href="/admin/products">
                                                <ShoppingCart className="mr-3 h-5 w-5" />
                                                <div className="text-left">
                                                    <div className="font-semibold">Gestionar Productos</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        Controla tu inventario y precios
                                                    </div>
                                                </div>
                                            </Link>
                                        </Button>
                                    )}

                                    {hasRestaurant && (
                                        <>
                                            <Button variant="outline" className="h-auto py-4 justify-start" asChild>
                                                <Link href="/admin/restaurant/pos">
                                                    <UtensilsCrossed className="mr-3 h-5 w-5" />
                                                    <div className="text-left">
                                                        <div className="font-semibold">Punto de Venta</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            Abre el POS para tomar pedidos
                                                        </div>
                                                    </div>
                                                </Link>
                                            </Button>
                                            <Button variant="outline" className="h-auto py-4 justify-start" asChild>
                                                <Link href="/admin/restaurant/orders">
                                                    <ChefHat className="mr-3 h-5 w-5" />
                                                    <div className="text-left">
                                                        <div className="font-semibold">Cocina / Comandas</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            Gestiona las órdenes en la cocina
                                                        </div>
                                                    </div>
                                                </Link>
                                            </Button>
                                        </>
                                    )}

                                    <Button variant="outline" className="h-auto py-4 justify-start" asChild>
                                        <Link href="/admin/users">
                                            <Users className="mr-3 h-5 w-5" />
                                            <div className="text-left">
                                                <div className="font-semibold">Gestionar Usuarios</div>
                                                <div className="text-xs text-muted-foreground">
                                                    Administra roles y permisos
                                                </div>
                                            </div>
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
