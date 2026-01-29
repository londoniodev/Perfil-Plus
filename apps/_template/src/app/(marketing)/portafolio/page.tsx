import { Metadata } from "next";
import PortafolioContent from "./PortafolioContent";

export const metadata: Metadata = {
    title: "Portafolio | Casos de Éxito en Consultoría y Coaching",
    description: "Conoce casos reales de transformación organizacional, liderazgo y desarrollo profesional. Resultados medibles en empresas y personas.",
    keywords: ["portafolio consultoría", "casos de éxito", "transformación organizacional", "coaching empresarial"],
    openGraph: {
        title: "Portafolio | Casos de Éxito en Consultoría y Coaching",
        description: "Conoce casos reales de transformación organizacional, liderazgo y desarrollo profesional.",
        type: "website",
    },
    alternates: {
        canonical: "/portafolio",
    },
};

export default function PortafolioPage() {
    return <PortafolioContent />;
}

