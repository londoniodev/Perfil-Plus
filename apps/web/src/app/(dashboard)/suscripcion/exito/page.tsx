import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function SuscripcionExitoPage() {
    return (
        <div className="min-h-[80vh] flex items-center justify-center p-8 bg-background">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="text-7xl mb-4 animate-bounce">🎉</div>
                <h1 className="text-3xl md:text-4xl font-bold font-serif text-success">¡Bienvenido a Premium!</h1>
                <p className="text-foreground-muted text-lg leading-relaxed">
                    Tu suscripción ha sido activada exitosamente. Ya puedes acceder a todo el contenido exclusivo.
                </p>
                <div className="pt-4">
                    <Button asChild size="lg" className="shadow-lg shadow-success/20 w-full md:w-auto">
                        <Link href="/cursos">Explorar Cursos</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
