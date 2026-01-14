"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "@/app/styles/auth.module.css";
import { API_BASE } from "@/lib/config";
import { AuthLayout } from "@/app/components/auth/AuthLayout";

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
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Pantalla de éxito con instrucciones de verificación
    if (success) {
        return (
            <div className={styles.successContainer}>
                <div className={`${styles.loginCard} ${styles.successCard}`}>
                    <div className={styles.successIcon}>
                        ✉️
                    </div>

                    <h1 className="card-title mb-sm">¡Revisa tu email!</h1>

                    <p className="card-text">
                        Te hemos enviado un correo de verificación a{" "}
                        <strong>{formData.email}</strong>
                    </p>

                    <p className="text-muted text-sm mb-lg">
                        Haz clic en el enlace del correo para verificar tu cuenta y
                        acceder a todos los contenidos. El enlace expira en 24 horas.
                    </p>

                    <div className={styles.tipBox}>
                        💡 <strong>Tip:</strong> Revisa también tu carpeta de spam si no ves el correo.
                    </div>

                    <div className="flex-center">
                        <Link
                            href="/login"
                            className="btn btn-primary"
                        >
                            Ir a Iniciar Sesión
                        </Link>
                        <button
                            onClick={() => setSuccess(false)}
                            className="btn btn-secondary"
                        >
                            Registrar otro email
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <AuthLayout>
            <div className={styles.loginCard}>
                <h1 className="card-title text-center mb-sm">Crear Cuenta</h1>
                <p className="card-text text-center mb-lg">
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
                        <div className={styles.errorBox}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary btn-block"
                        disabled={loading}
                    >
                        {loading ? "Creando cuenta..." : "Registrarse"}
                    </button>
                </form>

                <div className="mt-lg text-center text-sm text-muted">
                    ¿Ya tienes una cuenta?{" "}
                    <Link href="/login" className="link-primary">
                        Inicia sesión aquí
                    </Link>
                </div>
            </div>
        </AuthLayout>
    );
}
