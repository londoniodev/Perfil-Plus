"use client";

import { useState, useEffect } from "react";
import styles from "./suscripcion.module.css";
import { API_BASE } from "@/lib/config";
import ActiveSubscriptionCard from "@/app/components/subscription/ActiveSubscriptionCard";
import PricingCard from "@/app/components/subscription/PricingCard";

// ============================================================================
// TIPOS
// ============================================================================

interface SubscriptionStatus {
    hasSubscription: boolean;
    status: string | null;
    startDate: string | null;
    endDate: string | null;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function SuscripcionPage() {
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Verificación de sesión basada en el objeto 'user' (Auth v2 usa Cookies)
    const user = typeof window !== "undefined" ? localStorage.getItem("user") : null;

    useEffect(() => {
        if (user) {
            fetchSubscriptionStatus();
        } else {
            setLoading(false);
        }
    }, [user]);

    const fetchSubscriptionStatus = async () => {
        try {
            const res = await fetch(`${API_BASE}/payments/subscription/status`, {
                credentials: "include", // Enviar Cookies
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
        if (!user) {
            // Guardar ruta actual para redirect post-login
            window.location.href = `/login?redirect=/suscripcion`;
            return;
        }

        setProcessing(true);
        setError(null);

        try {
            // Auth v2: Usar cookies (credentials: include) y no header Authorization
            const res = await fetch(`${API_BASE}/payments/subscription/checkout`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
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
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Error desconocido";
            setError(message);
        } finally {
            setProcessing(false);
        }
    };

    const handleCancel = async () => {
        if (!confirm("¿Estás seguro de que deseas cancelar tu suscripción?")) return;

        try {
            const res = await fetch(`${API_BASE}/payments/subscription`, {
                method: "DELETE",
                credentials: "include",
            });

            if (!res.ok) {
                throw new Error("Error al cancelar la suscripción");
            }

            fetchSubscriptionStatus();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Error desconocido";
            alert(message);
        }
    };

    // Estado de carga
    if (loading) {
        return (
            <div className={styles.subscriptionPage}>
                <div className="container" style={{ padding: "10rem 0", textAlign: "center" }}>
                    Cargando...
                </div>
            </div>
        );
    }

    const isActive = subscriptionStatus?.status === "ACTIVE";

    return (
        <div className={styles.subscriptionPage}>
            {/* Hero */}
            <section className={styles.subscriptionHero}>
                <div className="container">
                    <h1>Suscripción Premium</h1>
                    <p>
                        Accede a todo el contenido exclusivo: cursos, lecciones en video,
                        evaluaciones y material de apoyo.
                    </p>
                </div>
            </section>

            {/* Contenido principal */}
            <section className={styles.pricingSection}>
                <div className="container">
                    {isActive ? (
                        <ActiveSubscriptionCard
                            endDate={subscriptionStatus?.endDate ?? null}
                            onCancel={handleCancel}
                        />
                    ) : (
                        <PricingCard
                            onSubscribe={handleSubscribe}
                            processing={processing}
                            error={error}
                        />
                    )}
                </div>
            </section>
        </div>
    );
}
