import Link from "next/link";

export function CursosHero() {
    return (
        <header className="px-6 pt-16 pb-10 md:pt-20 md:pb-12 text-center relative overflow-hidden">
            {/* Gradient background accent */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/8 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 max-w-lg mx-auto">
                <h1 className="font-bold text-3xl md:text-4xl text-primary mb-4 leading-tight tracking-tight">
                    Capacitaciones para tu equipo
                </h1>
                <p className="text-foreground font-semibold text-lg mb-2">
                    Aprende con los expertos de Cocinasiete
                </p>
                <p className="text-muted-foreground text-sm mb-8 leading-relaxed max-w-[320px] mx-auto">
                    Cursos especializados para restaurantes, bares y negocios
                    gastronómicos.
                </p>
                <Link
                    href="#cursos"
                    className="inline-block bg-primary text-primary-foreground font-bold text-sm tracking-wide px-8 py-3 rounded-full shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-transform uppercase"
                >
                    Ver Cursos
                </Link>
            </div>
        </header>
    );
}
