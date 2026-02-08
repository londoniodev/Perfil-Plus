import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth-server";
import { PrismaClient } from "@alvarosky/database-management";
import { getTenantId } from "@/lib/config-server";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Separator } from "@alvarosky/ui";
import {
    Users,
    ShoppingCart,
    BookOpen,
    TrendingUp,
    Package,
    Calendar,
    DollarSign,
    GraduationCap,
    Settings,
    Sparkles,
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

    return (
        <div className="flex flex-col min-h-screen">
            {/* Header */}
            <header className="border-b bg-background px-6 py-4">
                <div className="max-w-7xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                Hola, {user.name || "Admin"} 👋
                            </h1>
                            <p className="text-sm text-muted-foreground mt-1 capitalize">
                                {currentDate}
                            </p>
                        </div>
                        <Button variant="outline" asChild>
                            <Link href="/admin/settings">
                                <Settings className="mr-2 h-4 w-4" />
                                Configuración
                            </Link>
                        </Button>
                    </div>
                </div>
            </header>

            {/* Content */}
            <div className="flex-1 px-6 py-8">
                <div className="max-w-7xl space-y-8">
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
                                    {/* LMS Stats */}
                                    {hasLMS && (
                                        <>
                                            <StatsCard
                                                title="Estudiantes Activos"
                                                value="1,234"
                                                icon={Users}
                                                trend="+12%"
                                                trendUp={true}
                                            />
                                            <StatsCard
                                                title="Cursos Completados"
                                                value="89"
                                                icon={GraduationCap}
                                                trend="+8%"
                                                trendUp={true}
                                            />
                                        </>
                                    )}

                                    {/* E-commerce Stats */}
                                    {hasShop && (
                                        <>
                                            <StatsCard
                                                title="Ventas Totales"
                                                value="$12,450"
                                                icon={DollarSign}
                                                trend="+18%"
                                                trendUp={true}
                                            />
                                            <StatsCard
                                                title="Pedidos Pendientes"
                                                value="23"
                                                icon={Package}
                                                trend="-5%"
                                                trendUp={false}
                                            />
                                        </>
                                    )}

                                    {/* Blog Stats */}
                                    {hasBlog && (
                                        <StatsCard
                                            title="Artículos Publicados"
                                            value="47"
                                            icon={BookOpen}
                                            trend="+3 este mes"
                                        />
                                    )}

                                    {/* General Stats */}
                                    <StatsCard
                                        title="Usuarios Totales"
                                        value="2,847"
                                        icon={Users}
                                        trend="+24%"
                                        trendUp={true}
                                    />
                                </div>
                            </div>

                            <Separator />

                            {/* Chart Placeholder */}
                            <div>
                                <h2 className="text-lg font-semibold mb-4">Análisis de Rendimiento</h2>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Ingresos vs Tiempo</CardTitle>
                                        <CardDescription>
                                            Evolución de ingresos en los últimos 7 días
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-center h-[300px] bg-muted/30 rounded-lg border-2 border-dashed">
                                            <div className="text-center space-y-2">
                                                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto" />
                                                <p className="text-sm text-muted-foreground">
                                                    Gráfico de tendencias
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    Próximamente: Integración con Chart.js o Recharts
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

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
