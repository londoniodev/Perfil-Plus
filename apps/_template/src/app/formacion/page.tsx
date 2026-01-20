import { Metadata } from "next";
import FormacionContent from "./FormacionContent";

export const metadata: Metadata = {
    title: "Formación | Cursos de Liderazgo y Desarrollo Personal",
    description: "Programas de formación en liderazgo transformacional, psicología organizacional e inteligencia emocional. Desarrolla habilidades para liderar equipos y organizaciones.",
    keywords: ["cursos liderazgo", "formación profesional", "psicología organizacional", "inteligencia emocional", "desarrollo personal"],
    openGraph: {
        title: "Formación | Cursos de Liderazgo y Desarrollo Personal",
        description: "Programas de formación en liderazgo transformacional, psicología organizacional e inteligencia emocional.",
        type: "website",
    },
    alternates: {
        canonical: "/formacion",
    },
};

import { siteConfig } from "@/config/site";
import { notFound } from "next/navigation";

export default function FormacionPage() {
    if (!siteConfig.features.lms.enabled) return notFound();

    return <FormacionContent />;
}


