"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "@/styles/auth.module.css";
import { API_BASE } from "@/lib/config";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/Card";

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: ""
    });
    const [loading, setLoading] = useState(false);
    const toast = useToast();
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include", // Permitir cookies
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Error al registrarse");
            }

            // Mostrar mensaje de verificación
            setSuccess(true);

            // Pantalla de éxito con instrucción de verificación
            // (Los tokens ya no se guardan en localStorage, se manejan vía cookies si el backend los enviara,
            // pero el flujo de registro ahora pide verificación primero)
            if (data.accessToken) {
                // Si el backend logueara automáticamente (no es el caso actual con email verify), 
                // las cookies ya estarían puestas.
                // localStorage.setItem("user", JSON.stringify(data.user)); 
            }

        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Pantalla de éxito con instrucciones de verificación
    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center p-8 bg-background">
                <Card className="w-full max-w-[500px] text-center border-green-500/20 shadow-2xl shadow-green-500/10">
                    <CardHeader>
                        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 bg-gradient-to-br from-indigo-500 to-purple-600 text-4xl shadow-lg">
                            ✉️
                        </div>

                        <CardTitle className="mb-2 text-2xl">¡Revisa tu email!</CardTitle>

                        <CardDescription className="text-base text-foreground/90">
                            Te hemos enviado un correo de verificación a{" "}
                            <strong className="text-primary">{formData.email}</strong>
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <p className="text-muted-foreground text-sm">
                            Haz clic en el enlace del correo para verificar tu cuenta y
                            acceder a todos los contenidos. El enlace expira en 24 horas.
                        </p>

                        <div className="p-4 bg-indigo-500/10 rounded-lg text-sm text-foreground-muted border border-indigo-500/20">
                            💡 <strong>Tip:</strong> Revisa también tu carpeta de spam si no ves el correo.
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                            <Button asChild className="w-full sm:w-auto">
                                <Link href="/login">Ir a Iniciar Sesión</Link>
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={() => setSuccess(false)}
                                className="w-full sm:w-auto"
                            >
                                Registrar otro email
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <AuthLayout>
            <Card className="w-full max-w-md mx-auto lg:bg-transparent lg:border-none lg:shadow-none lg:p-0 bg-card/50 backdrop-blur-md border-white/10">
                <CardHeader className="text-center px-0 pt-0">
                    <CardTitle className="text-3xl font-bold mb-2">Crear Cuenta</CardTitle>
                    <CardDescription className="text-base">
                        Únete a nuestra comunidad para acceder a contenido exclusivo.
                    </CardDescription>
                </CardHeader>

                <CardContent className="px-0">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Nombre Completo</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                placeholder="Tu nombre"
                                minLength={2}
                                className="flex h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                                placeholder="tucorreo@ejemplo.com"
                                className="flex h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Contraseña</label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                                placeholder="Mínimo 8 caracteres"
                                minLength={8}
                                className="flex h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
                            />
                        </div>

                        <Button
                            type="submit"
                            fullWidth
                            disabled={loading}
                            size="lg"
                            className="mt-2"
                        >
                            {loading ? "Creando cuenta..." : "Registrarse"}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm text-muted-foreground">
                        ¿Ya tienes una cuenta?{" "}
                        <Link href="/login" className="text-primary hover:underline font-medium">
                            Inicia sesión aquí
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </AuthLayout>
    );
}
