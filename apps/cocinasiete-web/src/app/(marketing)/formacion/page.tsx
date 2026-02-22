import { Metadata } from "next";
import {
    CursosHero,
    CursosCategorias,
    CursosPopulares,
    CursosNuevos,
} from "@/components/cursos";
import { API_BASE, TENANT_ID } from "@/lib/config";
import { Theme } from "@/types/lms";

export const metadata: Metadata = {
    title: "Formación | Cocina Siete",
    description:
        "Capacitaciones especializadas para restaurantes, bares y negocios gastronómicos.",
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

export default async function FormacionPage() {
    const themes = await getThemesWithCourses();

    return (
        <main className="light min-h-screen bg-background pb-20">
            <CursosHero />
            <CursosCategorias themes={themes} />
            <CursosPopulares themes={themes} />
            <CursosNuevos themes={themes} />
        </main>
    );
}
