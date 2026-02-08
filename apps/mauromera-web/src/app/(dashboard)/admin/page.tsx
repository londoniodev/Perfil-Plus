import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth-server";
import { Button, Card, CardContent, Separator } from "@alvarosky/ui";
import {
    Users,
    ShoppingCart,
    BookOpen,
    Settings,
    Sparkles,
} from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardPage() {
    const user = await getSessionUser();

    if (!user) {
        redirect("/login?redirect=/admin");
    }

    if (user.role !== "ADMIN") {
        redirect("/perfil");
    }

    const currentDate = new Date().toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

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
                    {/* Welcome Card */}
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-16 px-4">
                            <div className="rounded-full bg-primary/10 p-4 mb-4">
                                <Sparkles className="h-12 w-12 text-primary" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">
                                Panel de Administración
                            </h2>
                            <p className="text-muted-foreground text-center mb-6 max-w-md">
                                Gestiona tu contenido, usuarios y configuración desde aquí.
                            </p>
                        </CardContent>
                    </Card>

                    <Separator />

                    {/* Quick Actions */}
                    <div>
                        <h2 className="text-lg font-semibold mb-4">Accesos Rápidos</h2>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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

                            <Button variant="outline" className="h-auto py-4 justify-start" asChild>
                                <Link href="/admin/blog">
                                    <Sparkles className="mr-3 h-5 w-5" />
                                    <div className="text-left">
                                        <div className="font-semibold">Gestionar Blog</div>
                                        <div className="text-xs text-muted-foreground">
                                            Publica artículos y noticias
                                        </div>
                                    </div>
                                </Link>
                            </Button>

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
                </div>
            </div>
        </div>
    );
}
