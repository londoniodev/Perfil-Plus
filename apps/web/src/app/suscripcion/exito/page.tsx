import Link from "next/link";
import styles from "../suscripcion.module.css";

export default function SuscripcionExitoPage() {
    return (
        <div className={`${styles.resultPage} ${styles.success}`}>
            <div className="container">
                <div className={styles.resultIcon}>🎉</div>
                <h1>¡Bienvenido a Premium!</h1>
                <p>Tu suscripción ha sido activada exitosamente. Ya puedes acceder a todo el contenido exclusivo.</p>
                <Link href="/cursos" className="btn btn-primary">
                    Ir a los cursos
                </Link>
            </div>
        </div>
    );
}
