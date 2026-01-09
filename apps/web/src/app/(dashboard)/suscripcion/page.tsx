"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./suscripcion.module.css";
import { API_BASE } from "@/lib/config";

interface SubscriptionStatus {
    hasSubscription: boolean;
    status: string | null;
    startDate: string | null;
    endDate: string | null;
}

export default function SuscripcionPage() {
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
    const [error, setError] = useState<string | null>(null);

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    useEffect(() => {
        if (token) {
            fetchSubscriptionStatus();
        } else {
            setLoading(false);
        }
    }, [token]);

    const fetchSubscriptionStatus = async () => {
        try {
            const res = await fetch(`${API_BASE}/payments/subscription/status`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setSubscriptionStatus(data);
            }
        } catch (err) {
            console.error("Error fetching subscription status", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubscribe = async () => {
        if (!token) {
            window.location.href = "/login?redirect=/suscripcion";
            return;
        }

        setProcessing(true);
        setError(null);

        try {
            const res = await fetch(`${API_BASE}/payments/subscription/checkout`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    frontUrl: window.location.origin,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Error al crear el checkout");
            }

            const data = await res.json();

            // Redirigir a Mercado Pago
            if (data.initPoint) {
                window.location.href = data.initPoint;
            } else if (data.sandboxInitPoint) {
                window.location.href = data.sandboxInitPoint;
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setProcessing(false);
        }
    };

    const handleCancel = async () => {
        if (!confirm("¿Estás seguro de que deseas cancelar tu suscripción?")) return;

        try {
            const res = await fetch(`${API_BASE}/payments/subscription`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) {
                throw new Error("Error al cancelar la suscripción");
            }

            fetchSubscriptionStatus();
        } catch (err: any) {
            alert(err.message);
        }
    };

    if (loading) {
        return (
            <div className={styles.subscriptionPage}>
                <div className="container" style={{ padding: "10rem 0", textAlign: "center" }}>
                    Cargando...
                </div>
            </div>
        );
    }

    return (
        <div className={styles.subscriptionPage}>
            <section className={styles.subscriptionHero}>
                <div className="container">
                    <h1>Suscripción Premium</h1>
                    <p>
                        Accede a todo el contenido exclusivo: cursos, lecciones en video,
                        evaluaciones y material de apoyo.
                    </p>
                </div>
            </section>

            <section className={styles.pricingSection}>
                <div className="container">
                    {subscriptionStatus?.status === "ACTIVE" ? (
                        <div className={styles.activeStatus}>
                            <div className={styles.activeIcon}>✨</div>
                            <h3>¡Eres miembro Premium!</h3>
                            <p>
                                Tu suscripción está activa hasta el{" "}
                                {subscriptionStatus.endDate
                                    ? new Date(subscriptionStatus.endDate).toLocaleDateString("es-CO", {
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                    })
                                    : "próximo mes"}
                            </p>
                            <Link href="/cursos" className="btn btn-primary">
                                Ir a los cursos
                            </Link>
                            <div style={{ marginTop: "1.5rem" }}>
                                <button onClick={handleCancel} className={styles.cancelBtn}>
                                    Cancelar suscripción
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className={styles.pricingCard}>
                            <div className={styles.cardHeader}>
                                <h2>Plan Mensual</h2>
                                <div className={styles.price}>
                                    <span className={styles.currency}>$</span>
                                    <span className={styles.amount}>49.900</span>
                                    <span className={styles.period}>/mes</span>
                                </div>
                            </div>
                            <div className={styles.cardBody}>
                                <ul className={styles.features}>
                                    <li>
                                        <span className={styles.checkIcon}>✓</span>
                                        Acceso a todos los cursos premium
                                    </li>
                                    <li>
                                        <span className={styles.checkIcon}>✓</span>
                                        Lecciones en video HD
                                    </li>
                                    <li>
                                        <span className={styles.checkIcon}>✓</span>
                                        Evaluaciones y certificaciones
                                    </li>
                                    <li>
                                        <span className={styles.checkIcon}>✓</span>
                                        Contenido exclusivo del blog
                                    </li>
                                    <li>
                                        <span className={styles.checkIcon}>✓</span>
                                        Material de apoyo descargable
                                    </li>
                                    <li>
                                        <span className={styles.checkIcon}>✓</span>
                                        Soporte prioritario
                                    </li>
                                </ul>

                                {error && (
                                    <div style={{ color: "#ef4444", marginBottom: "1rem", textAlign: "center" }}>
                                        {error}
                                    </div>
                                )}

                                <button
                                    onClick={handleSubscribe}
                                    className={styles.subscribeBtn}
                                    disabled={processing}
                                >
                                    {processing ? "Procesando..." : "Suscribirme ahora"}
                                </button>

                                <p style={{ fontSize: "0.85rem", color: "var(--foreground-muted)", textAlign: "center", marginTop: "1rem" }}>
                                    Pago seguro con Mercado Pago. Puedes cancelar cuando quieras.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
