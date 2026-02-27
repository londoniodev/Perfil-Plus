import Link from "next/link";
import { Button } from "@alvarosky/ui";

export default function SuscripcionErrorPage() {
    return (
        <div className="min-h-[80vh] flex items-center justify-center p-8 bg-background">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="text-7xl mb-4 text-error">❌</div>
                <h1 className="text-3xl md:text-4xl font-bold font-serif text-white">Pago no completado</h1>
                <p className="text-foreground-muted text-lg leading-relaxed">
                    Hubo un problema con tu pago. Por favor, inténtalo nuevamente o contacta a soporte si persiste.
                </p>
                <div className="pt-4">
                    <Button asChild size="lg" variant="secondary" className="w-full md:w-auto">
                        <Link href="/suscripcion">Volver a intentar</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}

