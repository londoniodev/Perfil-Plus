"use client";

import { useEffect, useState } from "react";
import { useRouter, redirect } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@alvarosky/ui";
import { Avatar, AvatarFallback, AvatarImage } from "@alvarosky/ui";
import { Button, Separator } from "@alvarosky/ui";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@alvarosky/ui";
import { Badge } from "@alvarosky/ui";
import { IconUser, IconShoppingBag, IconShield, IconLogout, IconLoader, IconCheck, IconCrown, AdminPageWrapper } from "@alvarosky/ui";

export default function PerfilPage() {
    const router = useRouter();
    const { user, loading, logout } = useAuth();
    const [activeTab, setActiveTab] = useState("data");

    if (!loading && !user) {
        redirect("/login");
    }

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <IconLoader className="animate-spin text-muted-foreground" size={32} />
            </div>
        );
    }

    if (!user) return null;

    const initials = user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);

    return (
        <AdminPageWrapper
            title="Mi Perfil"
            description="Gestiona tu información personal y configuración de cuenta"
            className="max-w-4xl mx-auto"
        >
            <div className="flex flex-col lg:flex-row gap-8 items-start">
                {/* Sidebar / Profile Card */}
                <Card className="w-full lg:w-72 shrink-0 sticky top-4">
                    <CardHeader className="text-center pb-2">
                        <div className="mx-auto mb-4 relative">
                            <Avatar className="w-24 h-24 border-4 border-background shadow-xl">
                                <AvatarImage src={user.avatar || ""} alt={user.name} />
                                <AvatarFallback className="text-2xl bg-primary/10 text-primary">{initials}</AvatarFallback>
                            </Avatar>
                            {user.role === 'ADMIN' && (
                                <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground border-2 border-background px-3">
                                    Admin
                                </Badge>
                            )}
                        </div>
                        <CardTitle className="text-lg">{user.name}</CardTitle>
                        <CardDescription className="text-sm">{user.email}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Separator />
                        <div className="flex justify-center">
                            {user.hasActiveSubscription ? (
                                <Badge variant="secondary" className="bg-gradient-to-r from-amber-200 to-yellow-400 text-yellow-900 border-yellow-200">
                                    <IconCrown className="mr-1 h-3 w-3" /> Suscripción Activa
                                </Badge>
                            ) : (
                                <Badge variant="outline">Plan Gratuito</Badge>
                            )}
                        </div>
                        <Button
                            variant="outline"
                            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 transition duration-200 active:scale-[0.98]"
                            onClick={logout}
                        >
                            <IconLogout className="mr-2 h-4 w-4" /> Cerrar Sesión
                        </Button>
                    </CardContent>
                </Card>

                {/* Main Content */}
                <div className="flex-1 w-full space-y-6">
                    <Tabs defaultValue="data" className="w-full" onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-3 mb-6">
                            <TabsTrigger value="data" className="transition duration-200">
                                <IconUser className="mr-2 h-4 w-4" /> Mis Datos
                            </TabsTrigger>
                            <TabsTrigger value="purchases" className="transition duration-200">
                                <IconShoppingBag className="mr-2 h-4 w-4" /> Mis Compras
                            </TabsTrigger>
                            <TabsTrigger value="security" className="transition duration-200">
                                <IconShield className="mr-2 h-4 w-4" /> Seguridad
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="data" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Información Personal</CardTitle>
                                    <CardDescription>Gestiona tu información de perfil.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-muted-foreground">Nombre Completo</label>
                                            <div className="p-3 bg-muted rounded-md text-foreground border border-transparent focus-within:ring-2 focus-within:ring-primary/20 transition duration-200">
                                                {user.name}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-muted-foreground">Correo Electrónico</label>
                                            <div className="p-3 bg-muted rounded-md text-foreground">
                                                {user.email}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-muted-foreground">Rol</label>
                                            <div className="p-3 bg-muted rounded-md text-foreground capitalize">
                                                {user.role.toLowerCase()}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-muted-foreground">Estado de verificación</label>
                                            <div className="flex items-center p-3 bg-muted rounded-md text-foreground">
                                                {user.emailVerified ? (
                                                    <span className="flex items-center text-green-600 font-medium">
                                                        <IconCheck className="mr-2 h-4 w-4" /> Verificado
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center text-yellow-600 font-medium">Pendiente</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {!user.hasActiveSubscription && user.role !== "ADMIN" && (
                                <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                                    <CardHeader>
                                        <CardTitle className="text-primary">¡Desbloquea contenido premium!</CardTitle>
                                        <CardDescription>Accede a todos nuestros cursos, ebooks y recursos exclusivos.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Button
                                            asChild
                                            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary transition duration-200 hover:scale-[1.01] active:scale-[0.98]"
                                        >
                                            <Link href="/suscripcion">
                                                Suscribirme Ahora
                                            </Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        <TabsContent value="purchases">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Mis Compras</CardTitle>
                                    <CardDescription>Accede a tus e-books y recursos comprados.</CardDescription>
                                </CardHeader>
                                <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                                        <IconShoppingBag size={32} />
                                    </div>
                                    <p className="text-muted-foreground max-w-md">
                                        Puedes ver y descargar todos tus libros en tu biblioteca personal.
                                    </p>
                                    <Button
                                        asChild
                                        className="transition duration-200 hover:scale-[1.01] active:scale-[0.98]"
                                    >
                                        <Link href="/ebooks/mis-compras">
                                            Ir a Mis E-books
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="security">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Seguridad</CardTitle>
                                    <CardDescription>Gestiona la seguridad de tu cuenta.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="p-4 border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10 dark:border-yellow-900/30 rounded-lg">
                                        <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Contraseña</h4>
                                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                            Si necesitas cambiar tu contraseña, por favor utiliza la opción de "Olvidé mi contraseña" en el login por el momento.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </AdminPageWrapper>
    );
}
