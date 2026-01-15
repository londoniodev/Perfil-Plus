import Link from "next/link";
import { Button } from "@/components/ui/Button";
import styles from "@/styles/post.module.css";

export default function NotFound() {
  return (
    <div className={styles.notFound}>
      <div className="container">
        <h1>404</h1>
        <h2>Artículo no encontrado</h2>
        <p>El artículo que buscas no existe o ha sido eliminado.</p>
        <Button asChild>
          <Link href="/blog">Volver al blog</Link>
        </Button>
      </div>
    </div>
  );
}
