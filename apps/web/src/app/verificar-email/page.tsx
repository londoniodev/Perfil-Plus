"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { API_BASE } from "@/lib/config";

type VerificationStatus = "loading" | "success" | "error" | "expired" | "no-token";

function VerifyEmailContent() {
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
            const res = await fetch(`${API_BASE}/auth/verify-email?token=${token}`);
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

    const containerStyle: React.CSSProperties = {
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        background: "var(--background)"
    };

    const cardStyle: React.CSSProperties = {
        maxWidth: "500px",
        width: "100%",
        textAlign: "center",
        padding: "3rem 2rem",
        background: "var(--surface)",
        borderRadius: "1rem",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)"
    };

    const iconStyle: React.CSSProperties = {
        width: "80px",
        height: "80px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 1.5rem",
        fontSize: "2.5rem"
    };

    if (status === "loading") {
        return (
            <div style={containerStyle}>
                <div style={cardStyle}>
                    <div style={{ ...iconStyle, background: "rgba(99, 102, 241, 0.1)" }}>
                        ⏳
                    </div>
                    <h1 style={{ marginBottom: "1rem" }}>Verificando tu email...</h1>
                    <p style={{ color: "var(--foreground-muted)" }}>
                        Por favor espera un momento.
                    </p>
                </div>
            </div>
        );
    }

    if (status === "no-token") {
        return (
            <div style={containerStyle}>
                <div style={cardStyle}>
                    <div style={{ ...iconStyle, background: "rgba(239, 68, 68, 0.1)" }}>
                        ❓
                    </div>
                    <h1 style={{ marginBottom: "1rem" }}>Token no encontrado</h1>
                    <p style={{ color: "var(--foreground-muted)", marginBottom: "2rem" }}>
                        El enlace de verificación no es válido. Asegúrate de copiar el enlace completo del email.
                    </p>
                    <Link href="/registro" className="btn btn-primary">
                        Crear cuenta nueva
                    </Link>
                </div>
            </div>
        );
    }

    if (status === "success") {
        return (
            <div style={containerStyle}>
                <div style={cardStyle}>
                    <div style={{
                        ...iconStyle,
                        background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)"
                    }}>
                        ✓
                    </div>
                    <h1 style={{ marginBottom: "1rem", color: "#22c55e" }}>
                        ¡Email verificado!
                    </h1>
                    <p style={{ color: "var(--foreground-muted)", marginBottom: "2rem" }}>
                        Tu cuenta ha sido verificada correctamente.
                        Ya puedes acceder a todo el contenido de la plataforma.
                    </p>
                    <Link
                        href="/admin/login"
                        className="btn btn-primary"
                        style={{ padding: "1rem 2rem" }}
                    >
                        Iniciar Sesión
                    </Link>
                </div>
            </div>
        );
    }

    if (status === "expired") {
        return (
            <div style={containerStyle}>
                <div style={cardStyle}>
                    <div style={{ ...iconStyle, background: "rgba(251, 146, 60, 0.1)" }}>
                        ⏰
                    </div>
                    <h1 style={{ marginBottom: "1rem", color: "#f97316" }}>
                        Enlace expirado
                    </h1>
                    <p style={{ color: "var(--foreground-muted)", marginBottom: "2rem" }}>
                        El enlace de verificación ha expirado.
                        Los enlaces son válidos por 24 horas.
                    </p>
                    <ResendVerificationForm />
                </div>
            </div>
        );
    }

    // Error state
    return (
        <div style={containerStyle}>
            <div style={cardStyle}>
                <div style={{ ...iconStyle, background: "rgba(239, 68, 68, 0.1)" }}>
                    ✕
                </div>
                <h1 style={{ marginBottom: "1rem", color: "#ef4444" }}>
                    Error de verificación
                </h1>
                <p style={{ color: "var(--foreground-muted)", marginBottom: "2rem" }}>
                    {message}
                </p>
                <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
                    <Link href="/registro" className="btn btn-primary">
                        Crear cuenta nueva
                    </Link>
                    <Link
                        href="/admin/login"
                        style={{
                            padding: "0.75rem 1.5rem",
                            border: "1px solid var(--border)",
                            borderRadius: "0.5rem",
                            color: "var(--foreground-muted)",
                            textDecoration: "none"
                        }}
                    >
                        Iniciar Sesión
                    </Link>
                </div>
            </div>
        </div>
    );
}

function ResendVerificationForm() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");

    const handleResend = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch(`${API_BASE}/auth/resend-verification`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok && !data.message?.includes("Si el email")) {
                throw new Error(data.message);
            }

            setSent(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <div style={{
                padding: "1.5rem",
                background: "rgba(34, 197, 94, 0.1)",
                borderRadius: "0.75rem",
                color: "#22c55e"
            }}>
                <p style={{ marginBottom: "0.5rem", fontWeight: 600 }}>✓ Email enviado</p>
                <p style={{ fontSize: "0.9rem", color: "var(--foreground-muted)" }}>
                    Si el email está registrado, recibirás un nuevo enlace de verificación.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleResend}>
            <p style={{ color: "var(--foreground-muted)", marginBottom: "1rem", fontSize: "0.9rem" }}>
                Ingresa tu email para recibir un nuevo enlace:
            </p>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tucorreo@ejemplo.com"
                required
                style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    border: "1px solid var(--border)",
                    borderRadius: "0.5rem",
                    marginBottom: "1rem",
                    background: "var(--background)",
                    color: "var(--foreground)"
                }}
            />
            {error && (
                <p style={{ color: "#ef4444", marginBottom: "1rem", fontSize: "0.9rem" }}>
                    {error}
                </p>
            )}
            <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ width: "100%" }}
            >
                {loading ? "Enviando..." : "Reenviar verificación"}
            </button>
        </form>
    );
}

export default function VerificarEmailPage() {
    return (
        <Suspense fallback={
            <div style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "var(--background)"
            }}>
                <p>Cargando...</p>
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    );
}
