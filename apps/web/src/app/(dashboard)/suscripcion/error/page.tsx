import Link from "next/link";
import styles from "@/app/styles/suscripcion.module.css";

export default function SuscripcionErrorPage() {
    return (
        <div className={`${styles.resultPage} ${styles.error}`}>
            <div className="container">
                <div className={styles.resultIcon}>❌</div>
                <h1>Pago no completado</h1>
                <p>Hubo un problema con tu pago. Por favor, inténtalo nuevamente o contacta a soporte.</p>
                <Link href="/suscripcion" className="btn btn-primary">
                    Volver a intentar
                </Link>
            </div>
        </div>
    );
}
