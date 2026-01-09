"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../admin/admin.module.css"; // Reuse login styles for consistency

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

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

            // Opcional: Auto-login tras registro si el backend devolviera tokens, 
            // pero normalmente se pide login o se redirige.
            // Si el backend devuelve tokens en register, podríamos guardarlos.
            // register de auth.service.ts suele retornar user o tokens.

            // Si el registro devuelve tokens, podríamos loguear de una.
            if (data.accessToken) {
                localStorage.setItem("token", data.accessToken);
                localStorage.setItem("refreshToken", data.refreshToken);
                localStorage.setItem("user", JSON.stringify(data.user));
                router.push("/suscripcion"); // Redirigir al flujo de compra
            } else {
                // Si no, redirigir al login
                router.push("/admin/login?registered=true");
            }

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

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
