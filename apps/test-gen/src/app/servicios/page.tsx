import type { Metadata } from "next";
import { PageHeader } from "@alvarosky/ui";
import { ServicesSelector } from "@/components/servicios/ServicesSelector";
import { ServicesPageSchema, FAQSchema, BreadcrumbSchema } from "@/components/seo/JsonLd";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
    title: "Servicios | Empresas, Explora y Psicoterapia",
    description: "Tres rutas de acompañamiento: consultoría organizacional, orientación vocacional con IA (Explora) y psicoterapia/coaching. Procesos claros, humanos y medibles.",
    keywords: ["consultoría organizacional", "psicoterapia", "coaching", "orientación vocacional", "Explora IA"],
    openGraph: {
        title: "Servicios | Empresas, Explora y Psicoterapia",
        description: "Tres rutas de acompañamiento: consultoría organizacional, orientación vocacional con IA (Explora) y psicoterapia/coaching.",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Servicios | Mauro Mera",
        description: "Consultoría organizacional, orientación vocacional con IA y psicoterapia.",
    },
    alternates: {
        canonical: "/servicios",
    },
};

// FAQ para SEO - Preguntas frecuentes sobre servicios
const serviciosFAQ = [
    {
        question: "¿Qué tipos de servicios ofrece Mauro Mera?",
        answer: "Ofrezco tres rutas de acompañamiento: consultoría organizacional para empresas, orientación vocacional y profesional con tecnología de IA (Explora), y psicoterapia/coaching individual.",
    },
    {
        question: "¿La consultoría organizacional es solo presencial?",
        answer: "No, la consultoría puede ser presencial, virtual o híbrida según las necesidades de la organización. Trabajamos con equipos en toda Colombia y Latinoamérica.",
    },
    {
        question: "¿Qué es Explora y cómo funciona?",
        answer: "Explora es un programa de orientación vocacional que combina test de perfil profesional con tecnología de IA. Incluye sesión de análisis personalizada y acceso a una plataforma con asistente inteligente.",
    },
    {
        question: "¿Las sesiones de psicoterapia son online?",
        answer: "Sí, ofrezco modalidad online vía Google Meet para sesiones desde cualquier lugar, y también presencial en Cali, Colombia. Las sesiones tienen una duración de 50 minutos.",
    },
    {
        question: "¿Cómo puedo agendar una consulta inicial?",
        answer: "Puedes contactarme directamente por WhatsApp al +57 318 377 1838 para agendar una reunión de diagnóstico gratuita de 30 minutos.",
    },
];



// ... (code)

export default function ServiciosPage() {
    return (
        <>
            {/* Structured Data para SEO */}
            <ServicesPageSchema />
            <FAQSchema items={serviciosFAQ} />
            <BreadcrumbSchema items={[
                { name: "Inicio", url: SITE_URL },
                { name: "Servicios", url: `${SITE_URL}/servicios` },
            ]} />

            <PageHeader
                className="container px-4 mx-auto pt-32 md:pt-32 mb-12"
                title="Servicios"
                description="Soluciones integrales en consultoría, formación y bienestar para potenciar el talento humano."
            />

            {/* El selector ocupa casi toda la pantalla inicial */}
            <ServicesSelector />
        </>
    );
}


