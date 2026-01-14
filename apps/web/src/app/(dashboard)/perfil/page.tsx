"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import styles from "@/app/styles/perfil.module.css";

export default function PerfilPage() {
    const router = useRouter();
    const { user, loading, logout } = useAuth();

    useEffect(() => {
        // Redirect to login if not authenticated (after loading completes)
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    if (loading) {
        return <div className={styles.loading}>Cargando perfil...</div>;
    }

    if (!user) return null;

    return (
        <div className={styles.profilePage}>
            <div className="container">
                <div className={styles.header}>
                    <h1>Mi Perfil</h1>
                    <button onClick={logout} className={styles.logoutBtn}>
                        Cerrar Sesión
                    </button>
                </div>

                <div className={styles.card}>
                    <div className={styles.infoRow}>
                        <span className={styles.label}>Nombre:</span>
                        <span className={styles.value}>{user.name}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.label}>Email:</span>
                        <span className={styles.value}>{user.email}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.label}>Verificado:</span>
                        <span className={`${styles.value} ${user.emailVerified ? styles.verified : styles.notVerified}`}>
                            {user.emailVerified ? "Sí ✓" : "No ✗"}
                        </span>
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.label}>Suscripción:</span>
                        <span className={`${styles.value} ${user.role === 'ADMIN' || user.hasActiveSubscription ? styles.active : styles.inactive}`}>
                            {user.role === 'ADMIN' ? "Acceso Total (Admin) ✓" : (user.hasActiveSubscription ? "Activa ✓" : "Inactiva")}
                        </span>
                    </div>
                </div>

                {!user.hasActiveSubscription && user.role !== "ADMIN" && (
                    <div className={styles.ctaCard}>
                        <h2>¡Desbloquea contenido premium!</h2>
                        <p>Accede a todos nuestros cursos, ebooks y recursos exclusivos.</p>
                        <Link href="/suscripcion" className={styles.ctaButton}>
                            Suscribirme Ahora
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
