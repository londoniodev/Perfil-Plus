import { Metadata } from "next";
import {
    CursosHero,
    CursosCategorias,
    CursosPopulares,
    CursosNuevos,
    CursosEmpty,
} from "@/components/cursos";
import { API_BASE, TENANT_ID } from "@/lib/config";
import { Theme } from "@/types/lms";

export const metadata: Metadata = {
    title: "Cursos | Cocina Siete",
    description:
        "Capacitaciones especializadas para restaurantes, bares y negocios gastronómicos. Aprende con los expertos de Cocinasiete.",
};

export const dynamic = "force-dynamic";

async function getThemesWithCourses(): Promise<Theme[]> {
    try {
        const res = await fetch(`${API_BASE}/lms/themes?include=courses`, {
            headers: {
                "Content-Type": "application/json",
                "x-tenant-id": TENANT_ID,
            },
            next: { revalidate: 60 },
        });
        if (!res.ok) return [];
        return res.json();
    } catch {
        return [];
    }
}

export default async function CursosPage() {
    const themes = await getThemesWithCourses();
    const totalCourses = themes.reduce(
        (sum, t) => sum + (t._count?.courses ?? 0),
        0
    );

    return (
        <main className="light min-h-screen bg-background pb-20">
            <CursosHero />
            {totalCourses === 0 ? (
                <CursosEmpty />
            ) : (
                <>
                    <CursosCategorias themes={themes} />
                    <CursosPopulares themes={themes} />
                    <CursosNuevos themes={themes} />
                </>
            )}
        </main>
    );
}
