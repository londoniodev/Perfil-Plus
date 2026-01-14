import Link from "next/link";
import styles from "@/app/styles/suscripcion.module.css";

export default function SuscripcionPendientePage() {
    return (
        <div className={`${styles.resultPage} ${styles.pending}`}>
            <div className="container">
                <div className={styles.resultIcon}>⏳</div>
                <h1>Pago en proceso</h1>
                <p>Tu pago está siendo procesado. Te notificaremos cuando se confirme tu suscripción.</p>
                <Link href="/" className="btn btn-primary">
                    Volver al inicio
                </Link>
            </div>
        </div>
    );
}
