import { Metadata } from "next";
import {
    CursosHero,
    CursosCategorias,
    CursosPopulares,
    CursosNuevos,
} from "@/components/cursos";

export const metadata: Metadata = {
    title: "Cursos | Cocina Siete",
    description:
        "Capacitaciones especializadas para restaurantes, bares y negocios gastronómicos. Aprende con los expertos de Cocinasiete.",
};

export const dynamic = "force-dynamic";

export default function CursosPage() {
    return (
        <main className="min-h-screen bg-background pb-20">
            <CursosHero />
            <CursosCategorias />
            <CursosPopulares />
            <CursosNuevos />
        </main>
    );
}
