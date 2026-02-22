import { Metadata } from "next";
import {
    CursosHero,
    CursosCategorias,
    CursosPopulares,
    CursosNuevos,
} from "@/components/cursos";

export const metadata: Metadata = {
    title: "Formación | Cocina Siete",
    description:
        "Capacitaciones especializadas para restaurantes, bares y negocios gastronómicos.",
};

export const dynamic = "force-dynamic";

export default function FormacionPage() {
    return (
        <main className="min-h-screen bg-background pb-20">
            <CursosHero />
            <CursosCategorias />
            <CursosPopulares />
            <CursosNuevos />
        </main>
    );
}
