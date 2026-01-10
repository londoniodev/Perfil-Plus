"use client";

import styles from "../../(dashboard)/suscripcion/suscripcion.module.css";

interface PricingCardProps {
    onSubscribe: () => void;
    processing: boolean;
    error: string | null;
}

/**
 * Características del plan de suscripción.
 */
const features = [
    "Acceso a todos los cursos premium",
    "Lecciones en video HD",
    "Evaluaciones y certificaciones",
    "Contenido exclusivo del blog",
    "Material de apoyo descargable",
    "Soporte prioritario",
];

/**
 * Tarjeta de precios para suscripción mensual.
 */
export default function PricingCard({ onSubscribe, processing, error }: PricingCardProps) {
    return (
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
                    {features.map((feature, index) => (
                        <li key={index}>
                            <span className={styles.checkIcon}>✓</span>
                            {feature}
                        </li>
                    ))}
                </ul>

                {error && (
                    <div style={{ color: "#ef4444", marginBottom: "1rem", textAlign: "center" }}>
                        {error}
                    </div>
                )}

                <button
                    onClick={onSubscribe}
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
    );
}
