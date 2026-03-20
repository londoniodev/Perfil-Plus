"use client";

import { useState } from "react";
import Link from "next/link";
import { API_BASE } from "@/lib/config";
import { useTenant } from "@/app/providers";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { useToast } from "@alvarosky/ui";
import { Button } from "@alvarosky/ui";
import { Input, InputWithIcon } from "@alvarosky/ui";
import { Label } from "@alvarosky/ui";
import { User, Mail, Lock, CheckCircle } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@alvarosky/ui";

export default function RegisterPage() {
    const { tenantId } = useTenant();
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
                headers: {
                    "Content-Type": "application/json",
                    "x-tenant-id": tenantId,
                },
                credentials: "include",
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Error al registrarse");
            }

            setSuccess(true);
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center p-8 bg-background">
                <Card className="w-full max-w-[500px] text-center border-green-500/20 shadow-2xl shadow-green-500/10 bg-zinc-950/80 backdrop-blur-md">
                    <CardHeader>
                        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg animate-pulse">
                            <CheckCircle className="h-10 w-10" />
                        </div>

                        <CardTitle className="mb-2 text-2xl font-serif">¡Revisa tu email!</CardTitle>

                        <CardDescription className="text-base text-foreground/90 leading-relaxed">
                            Te hemos enviado un correo de verificación a{" "}
                            <strong className="text-primary block mt-1 text-lg">{formData.email}</strong>
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <p className="text-muted-foreground text-sm">
                            Haz clic en el enlace del correo para verificar tu cuenta y
                            acceder a todos los contenidos. El enlace expira en 24 horas.
                        </p>

                        <div className="p-4 bg-primary/10 rounded-lg text-sm text-foreground-muted border border-primary/20 text-left">
                            💡 <strong>Tip:</strong> Revisa también tu carpeta de spam si no ves el correo en tu bandeja principal.
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
            <Card className="w-full border-none shadow-none bg-transparent p-0 text-zinc-100">
                <CardHeader className="text-center px-0 pt-0">
                    <CardTitle className="heading-h2 mb-2">Crear Cuenta</CardTitle>
                    <CardDescription className="text-slate-500">
                        Regístrate para acceder s todos los beneficios.
                    </CardDescription>
                </CardHeader>

                <CardContent className="px-0">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre Completo</Label>
                            <InputWithIcon
                                icon={<User className="h-5 w-5" />}
                                id="name"
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                placeholder="Tu nombre"
                                minLength={2}
                                className="bg-zinc-900/50 border-white/10 text-white placeholder:text-zinc-500 focus:border-white/20 focus:ring-0"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <InputWithIcon
                                icon={<Mail className="h-5 w-5" />}
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                                placeholder="tucorreo@ejemplo.com"
                                className="bg-zinc-900/50 border-white/10 text-white placeholder:text-zinc-500 focus:border-white/20 focus:ring-0"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Contraseña</Label>
                            <InputWithIcon
                                icon={<Lock className="h-5 w-5" />}
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                                placeholder="Mínimo 8 caracteres"
                                minLength={8}
                                className="bg-zinc-900/50 border-white/10 text-white placeholder:text-zinc-500 focus:border-white/20 focus:ring-0"
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full mt-2"
                            disabled={loading}
                            size="lg"
                        >
                            {loading ? "Creando cuenta..." : "Registrarse"}
                        </Button>
                    </form>

                    <div className="mt-8 text-center text-sm text-foreground-muted">
                        ¿Ya tienes una cuenta?{" "}
                        <Link href="/login" className="text-primary hover:underline font-medium hover:text-primary-light transition-colors">
                            Inicia sesión aquí
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </AuthLayout>
    );
}

