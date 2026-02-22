export function CursosHero() {
    return (
        <header className="relative pt-32 pb-16 md:pt-40 md:pb-20 overflow-hidden">
            {/* Gradient background accent */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/8 rounded-full blur-[120px]" />
            </div>

            <div className="container mx-auto px-4 relative z-10 text-center">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
                    Capacitaciones para tu equipo
                </h1>
                <p className="text-lg font-semibold text-foreground/90 mb-2">
                    Aprende con los expertos de Cocinasiete
                </p>
                <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                    Cursos especializados para restaurantes, bares y negocios gastronómicos.
                </p>
            </div>
        </header>
    );
}
