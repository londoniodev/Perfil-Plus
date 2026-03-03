"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { API_BASE } from "@/lib/config";
import { useTenant } from "@/app/providers";
import { useToast } from "@alvarosky/ui";
import { Button } from "@alvarosky/ui";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@alvarosky/ui";

type VerificationStatus = "loading" | "success" | "error" | "expired" | "no-token";

function VerifyEmailContent() {
    const { tenantId } = useTenant();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [status, setStatus] = useState<VerificationStatus>("loading");
    const [message, setMessage] = useState("");
    const [email, setEmail] = useState("");

    useEffect(() => {
        if (!token) {
            setStatus("no-token");
            return;
        }

        verifyEmail();
    }, [token]);

    const verifyEmail = async () => {
        try {
            const res = await fetch(`${API_BASE}/auth/verify-email?token=${token}`, {
                headers: { 'x-tenant-id': tenantId },
            });
            const data = await res.json();

            if (res.ok) {
                setStatus("success");
                setEmail(data.email || "");
                setMessage(data.message);
            } else if (data.message?.includes("expirado")) {
                setStatus("expired");
                setMessage(data.message);
            } else {
                setStatus("error");
                setMessage(data.message || "Error al verificar el email");
            }
        } catch (error) {
            setStatus("error");
            setMessage("Error de conexión. Intenta de nuevo.");
        }
    };

    // Estilos comunes (icon wrappers)
    const iconWrapperClass = "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl";
    const containerClass = "min-h-screen flex items-center justify-center p-8 bg-background";
    const cardClass = "w-full max-w-[500px] text-center shadow-xl border-border/50";

    if (status === "loading") {
        return (
            <div className={containerClass}>
                <Card className={cardClass}>
                    <CardHeader>
                        <div className={`${iconWrapperClass} bg-indigo-500/10`}>⏳</div>
                        <CardTitle>Verificando tu email...</CardTitle>
                        <CardDescription>Por favor espera un momento.</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    if (status === "no-token") {
        return (
            <div className={containerClass}>
                <Card className={cardClass}>
                    <CardHeader>
                        <div className={`${iconWrapperClass} bg-red-500/10`}>❓</div>
                        <CardTitle>Token no encontrado</CardTitle>
                        <CardDescription className="mb-4">
                            El enlace de verificación no es válido. Asegúrate de copiar el enlace completo del email.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild>
                            <Link href="/registro">Crear cuenta nueva</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (status === "success") {
        return (
            <div className={containerClass}>
                <Card className={cardClass}>
                    <CardHeader>
                        <div className={`${iconWrapperClass} bg-gradient-to-br from-green-500 to-green-600 text-white`}>✓</div>
                        <CardTitle className="text-green-500">¡Email verificado!</CardTitle>
                        <CardDescription className="mb-4 text-base">
                            Tu cuenta ha sido verificada correctamente.
                            Ya puedes acceder a todo el contenido de la plataforma.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild>
                            <Link href="/login">Iniciar Sesión</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (status === "expired") {
        return (
            <div className={containerClass}>
                <Card className={cardClass}>
                    <CardHeader>
                        <div className={`${iconWrapperClass} bg-orange-500/10`}>⏰</div>
                        <CardTitle className="text-orange-500">Enlace expirado</CardTitle>
                        <CardDescription className="mb-4">
                            El enlace de verificación ha expirado.
                            Los enlaces son válidos por 24 horas.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResendVerificationForm />
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Error state
    return (
        <div className={containerClass}>
            <Card className={cardClass}>
                <CardHeader>
                    <div className={`${iconWrapperClass} bg-red-500/10`}>✕</div>
                    <CardTitle className="text-red-500">Error de verificación</CardTitle>
                    <CardDescription className="mb-4 text-base">
                        {message}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-4 justify-center">
                    <Button asChild>
                        <Link href="/registro">Crear cuenta nueva</Link>
                    </Button>
                    <Button asChild variant="secondary">
                        <Link href="/login">Iniciar Sesión</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

function ResendVerificationForm() {
    const { tenantId } = useTenant();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const toast = useToast();

    const handleResend = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE}/auth/resend-verification`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-tenant-id": tenantId,
                },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok && !data.message?.includes("Si el email")) {
                throw new Error(data.message);
            }

            setSent(true);
            toast.success("Email enviado correctamente");
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <div className="p-6 bg-green-500/10 rounded-xl text-green-500 border border-green-500/20">
                <p className="font-semibold mb-2">✓ Email enviado</p>
                <p className="text-sm text-foreground-muted">
                    Si el email está registrado, recibirás un nuevo enlace de verificación.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleResend}>
            <p className="text-sm text-muted-foreground mb-4">
                Ingresa tu email para recibir un nuevo enlace:
            </p>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tucorreo@ejemplo.com"
                required
                className="w-full p-3 border border-border rounded-lg mb-4 bg-background text-foreground focus:ring-2 focus:ring-primary/50 outline-none"
            />

            <Button
                type="submit"
                fullWidth
                disabled={loading}
            >
                {loading ? "Enviando..." : "Reenviar verificación"}
            </Button>
        </form>
    );
}

export default function VerificarEmailPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-background">
                <p>Cargando...</p>
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    );
}

