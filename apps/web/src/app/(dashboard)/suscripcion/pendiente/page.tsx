import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function SuscripcionPendientePage() {
    return (
        <div className="min-h-[80vh] flex items-center justify-center p-8 bg-background">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="text-7xl mb-4 animate-pulse text-warning">⏳</div>
                <h1 className="text-3xl md:text-4xl font-bold font-serif text-white">Pago en proceso</h1>
                <p className="text-foreground-muted text-lg leading-relaxed">
                    Tu pago está siendo procesado por la plataforma. Te notificaremos por correo cuando se confirme tu suscripción.
                </p>
                <div className="pt-4">
                    <Button asChild size="lg" variant="secondary" className="w-full md:w-auto">
                        <Link href="/">Volver al inicio</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
