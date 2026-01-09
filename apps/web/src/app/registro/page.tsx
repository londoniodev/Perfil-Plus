"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../admin/admin.module.css";
import { API_BASE } from "@/lib/config";

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch(`${API_BASE}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
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
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Pantalla de éxito con instrucciones de verificación
    if (success) {
        return (
            <div style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "2rem",
                background: "var(--background)"
            }}>
                <div className={styles.loginCard} style={{ maxWidth: "500px", width: "100%", textAlign: "center" }}>
                    <div style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 1.5rem",
                        fontSize: "2.5rem"
                    }}>
                        ✉️
                    </div>

                    <h1 style={{ marginBottom: "0.5rem" }}>¡Revisa tu email!</h1>

                    <p style={{
                        color: "var(--foreground-muted)",
                        marginBottom: "1.5rem",
                        lineHeight: "1.6"
                    }}>
                        Te hemos enviado un correo de verificación a{" "}
                        <strong style={{ color: "var(--foreground)" }}>{formData.email}</strong>
                    </p>

                    <p style={{
                        color: "var(--foreground-muted)",
                        fontSize: "0.9rem",
                        marginBottom: "2rem"
                    }}>
                        Haz clic en el enlace del correo para verificar tu cuenta y
                        acceder a todos los contenidos. El enlace expira en 24 horas.
                    </p>

                    <div style={{
                        padding: "1rem",
                        background: "rgba(99, 102, 241, 0.1)",
                        borderRadius: "0.5rem",
                        marginBottom: "1.5rem",
                        fontSize: "0.85rem",
                        color: "var(--foreground-muted)"
                    }}>
                        💡 <strong>Tip:</strong> Revisa también tu carpeta de spam si no ves el correo.
                    </div>

                    <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
                        <Link
                            href="/admin/login"
                            className="btn btn-primary"
                            style={{ padding: "0.75rem 1.5rem" }}
                        >
                            Ir a Iniciar Sesión
                        </Link>
                        <button
                            onClick={() => setSuccess(false)}
                            style={{
                                padding: "0.75rem 1.5rem",
                                background: "transparent",
                                border: "1px solid var(--border)",
                                borderRadius: "0.5rem",
                                color: "var(--foreground-muted)",
                                cursor: "pointer"
                            }}
                        >
                            Registrar otro email
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            background: "var(--background)"
        }}>
            <div className={styles.loginCard} style={{ maxWidth: "450px", width: "100%" }}>
                <h1 style={{ textAlign: "center", marginBottom: "0.5rem" }}>Crear Cuenta</h1>
                <p style={{ textAlign: "center", color: "var(--foreground-muted)", marginBottom: "2rem" }}>
                    Únete a nuestra comunidad para acceder a contenido exclusivo.
                </p>

                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label>Nombre Completo</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            placeholder="Tu nombre"
                            minLength={2}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            placeholder="tucorreo@ejemplo.com"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Contraseña</label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                            placeholder="Mínimo 8 caracteres"
                            minLength={8}
                        />
                    </div>

                    {error && (
                        <div style={{
                            padding: "0.75rem",
                            background: "rgba(220, 38, 38, 0.1)",
                            border: "1px solid rgba(220, 38, 38, 0.2)",
                            color: "#ef4444",
                            borderRadius: "0.5rem",
                            fontSize: "0.9rem",
                            marginBottom: "1.5rem"
                        }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        style={{ width: "100%", padding: "1rem" }}
                    >
                        {loading ? "Creando cuenta..." : "Registrarse"}
                    </button>
                </form>

                <div style={{ marginTop: "2rem", textAlign: "center", fontSize: "0.9rem", color: "var(--foreground-muted)" }}>
                    ¿Ya tienes una cuenta?{" "}
                    <Link href="/admin/login" style={{ color: "var(--primary-light)", textDecoration: "none", fontWeight: 500 }}>
                        Inicia sesión aquí
                    </Link>
                </div>
            </div>
        </div>
    );
}
