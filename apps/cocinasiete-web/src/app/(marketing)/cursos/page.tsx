import {
    CursosHero,
    CursosCategorias,
    CursosPopulares,
    CursosNuevos,
} from "@/components/cursos";

export const dynamic = 'force-dynamic';

export default function CursosPage() {
    return (
        <div className="bg-white dark:bg-cs-bg-dark font-sans antialiased transition-colors duration-200 pb-20">
            <main className="max-w-md mx-auto relative min-h-screen">
                <CursosHero />
                <CursosCategorias />
                <CursosPopulares />
                <CursosNuevos />
            </main>
        </div>
    );
}
