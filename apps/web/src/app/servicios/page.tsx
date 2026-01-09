import type { Metadata } from "next";
import { ServicesSelector } from "../components/servicios/ServicesSelector";


export const metadata: Metadata = {
    title: "Servicios | Empresas, Explora y Psicoterapia — Mauro Mera",
    description: "Tres rutas de acompañamiento: consultoría organizacional, orientación vocacional con IA (Explora) y psicoterapia/coaching. Procesos claros, humanos y medibles.",
};

export default function ServiciosPage() {
    return (
        <>
            {/* El selector ocupa casi toda la pantalla inicial */}
            <ServicesSelector />

            {/* Mantenemos el CTA final general por si acaso el usuario quiere contacto directo sin elegir servicio específico */}

        </>
    );
}
