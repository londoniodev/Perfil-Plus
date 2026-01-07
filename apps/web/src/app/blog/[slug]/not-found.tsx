import Link from "next/link";
import styles from "./post.module.css";

export default function NotFound() {
  return (
    <div className={styles.notFound}>
      <div className="container">
        <h1>404</h1>
        <h2>Artículo no encontrado</h2>
        <p>El artículo que buscas no existe o ha sido eliminado.</p>
        <Link href="/blog" className="btn btn-primary">
          Volver al blog
        </Link>
      </div>
    </div>
  );
}
