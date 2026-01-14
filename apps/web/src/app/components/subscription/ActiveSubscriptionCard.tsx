"use client";

import Link from "next/link";
import styles from "@/app/styles/suscripcion.module.css";

interface ActiveSubscriptionCardProps {
    endDate: string | null;
    onCancel: () => void;
}

/**
 * Tarjeta que muestra el estado de una suscripción activa.
 */
export default function ActiveSubscriptionCard({ endDate, onCancel }: ActiveSubscriptionCardProps) {
    const formattedDate = endDate
        ? new Date(endDate).toLocaleDateString("es-CO", {
            day: "numeric",
            month: "long",
            year: "numeric",
        })
        : "próximo mes";

    return (
        <div className={styles.activeStatus}>
            <div className={styles.activeIcon}>✨</div>
            <h3>¡Eres miembro Premium!</h3>
            <p>
                Tu suscripción está activa hasta el {formattedDate}
            </p>
            <Link href="/cursos" className="btn btn-primary">
                Ir a los cursos
            </Link>
            <div style={{ marginTop: "1.5rem" }}>
                <button onClick={onCancel} className={styles.cancelBtn}>
                    Cancelar suscripción
                </button>
            </div>
        </div>
    );
}
