import Link from "next/link";

export function CursosHero() {
    return (
        <header className="px-6 pt-10 pb-8 text-center">
            <h1 className="font-display font-extrabold text-3xl md:text-4xl text-cs-secondary  mb-4 leading-tight">
                Capacitaciones para tu equipo
            </h1>
            <p className="text-gray-900  font-semibold text-lg mb-2">
                Aprende con los expertos de Cocinasiete
            </p>
            <p className="text-gray-500  text-sm mb-8 leading-relaxed max-w-[280px] mx-auto">
                Cursos especializados para restaurantes, bares y negocios gastronómicos.
            </p>
            <Link
                href="#categorias"
                className="inline-block bg-cs-primary text-white font-display font-bold text-sm tracking-wide px-8 py-3 rounded-full shadow-lg shadow-cs-primary/30 hover:scale-105 active:scale-95 transition-transform uppercase"
            >
                Ver Cursos
            </Link>
        </header>
    );
}
