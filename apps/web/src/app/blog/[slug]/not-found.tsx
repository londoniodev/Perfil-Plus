import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-background px-4">
      <div className="container text-center max-w-md mx-auto">
        <h1 className="text-8xl font-bold text-primary/10 mb-2 select-none">404</h1>
        <h2 className="text-3xl font-bold mb-4 font-serif relative z-10 -mt-8">Artículo no encontrado</h2>
        <p className="text-foreground-muted mb-8 text-lg">
          El artículo que buscas no existe, ha sido eliminado o la URL es incorrecta.
        </p>
        <Button asChild size="lg">
          <Link href="/blog">Volver al blog</Link>
        </Button>
      </div>
    </div>
  );
}
