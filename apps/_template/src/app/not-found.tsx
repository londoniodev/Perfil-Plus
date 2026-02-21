import Link from "next/link";
import { Button, IconFileDescription } from "@alvarosky/ui";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
            <div className="bg-muted rounded-full p-6 mb-6">
                <IconFileDescription size={64} className="text-muted-foreground" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight mb-2">Página no encontrada</h2>
            <p className="text-muted-foreground max-w-[500px] mb-8">
                Lo sentimos, no pudimos encontrar lo que buscas. Es posible que la página haya sido eliminada o la dirección sea incorrecta.
            </p>
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 border-none transition-colors">
                <Link href="/">
                    Volver al Inicio
                </Link>
            </Button>
        </div>
    );
}

