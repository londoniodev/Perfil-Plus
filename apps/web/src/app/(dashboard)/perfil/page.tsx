"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_BASE } from "@/lib/config";
import styles from "./perfil.module.css";

interface UserProfile {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    role: string;
    hasActiveSubscription: boolean;
}

export default function PerfilPage() {
    const router = useRouter();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Intentar obtener usuario del localStorage (para mostrar rápido)
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        // 2. Verificar sesión real con el backend (cookies)
        fetch(`${API_BASE}/auth/me`, {
            credentials: 'include', // Importante para enviar cookies
        })
            .then(async (res) => {
                if (!res.ok) throw new Error("No autenticado");
                const userData = await res.json();
                setUser(userData);
                // Actualizar localStorage
                localStorage.setItem("user", JSON.stringify(userData));
            })
            .catch(() => {
                // Si falla, limpiar y redirigir
                localStorage.removeItem("user");
                router.push("/login");
            })
            .finally(() => setLoading(false));
    }, [router]);

    const handleLogout = async () => {
        try {
            await fetch(`${API_BASE}/auth/logout`, {
                method: "POST",
                credentials: 'include',
            });
        } catch (error) {
            console.error("Logout error", error);
        }
        localStorage.removeItem("user");
        window.dispatchEvent(new Event("user-login"));
        router.push("/login");
    };

    if (loading && !user) {
        return <div className={styles.loading}>Cargando perfil...</div>;
    }

    if (!user) return null;

    return (
        <div className={styles.profilePage}>
            <div className="container">
                <div className={styles.header}>
                    <h1>Mi Perfil</h1>
                    <button onClick={handleLogout} className={styles.logoutBtn}>
                        Cerrar Sesión
                    </button>
                </div>

                <div className={styles.mainGrid}>
                    {/* Tarjeta de Información */}
                    <div className={styles.infoCard}>
                        <div className={styles.avatar}>
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <h2>{user.name}</h2>
                        <p>{user.email}</p>
                        <span className={`${styles.badge} ${user.emailVerified ? styles.verified : styles.pending}`}>
                            {user.emailVerified ? "Email Verificado" : "Verificación Pendiente"}
                        </span>
                    </div>

                    {/* Tarjeta de Acceso a Cursos */}
                    <div className={styles.coursesCard}>
                        <h3>Mis Cursos</h3>
                        <p>Accede a tu contenido educativo exclusivo.</p>

                        <div className={styles.actionButtons}>
                            <Link href="/cursos" className="btn btn-primary">
                                Ver Todos los Cursos
                            </Link>
                        </div>

                        {!user.hasActiveSubscription && (
                            <div className={styles.alertBox}>
                                <p>⚠️ No tienes una suscripción activa.</p>
                                <Link href="/suscripcion" className={styles.link}>
                                    Suscribirse ahora
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
