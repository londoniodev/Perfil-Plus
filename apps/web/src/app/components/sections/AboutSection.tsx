import Link from "next/link";
import { IconArrowRight } from "../icons";

import ProfileCarousel from "../ProfileCarousel";

export function AboutSection() {
    return (
        <section className="section" id="quien-soy" style={{ position: "relative", zIndex: 10, background: "var(--background)" }}>
            <div className="container grid-responsive-profile">
                <ProfileCarousel />

                <div>
                    <h2 className="section-title">Soy Mauro Mera</h2>
                    <ul
                        className="section-subtitle"
                        style={{
                            marginBottom: "1.5rem",
                            paddingLeft: "1.2rem",
                            listStyleType: "disc",
                            textAlign: "left",
                        }}
                    >
                        <li>Psicólogo</li>
                        <li>Consultor Experiencial</li>
                        <li>Consultor Estratégico</li>
                        <li>Gestor de Cultura Organizacional Certificado</li>
                        <li>Entrenador de liderazgo y gestión de equipos</li>
                        <li>Orientador Vocacional y Profesional</li>
                    </ul>

                    <p
                        className="section-subtitle"
                        style={{
                            marginBottom: "1.5rem",
                        }}
                    >
                        Con una trayectoria de más de 10 años, Integro la psicología, pedagogía
                        experiencial, técnicas, principios accionables y tecnología para diseñar
                        experiencias de aprendizaje, autoconocimiento y transformación del
                        potencial humano.
                    </p>
                    <p
                        className="section-subtitle"
                        style={{
                            marginBottom: "2.5rem",
                        }}
                    >
                        Acompaño a adultos, jóvenes, equipos y organizaciones a construir claridad
                        interna, decisiones informadas y resultados sostenibles, con procesos
                        profundos y aplicables a la vida real.
                    </p>
                    <Link href="#metodo" className="btn btn-ghost">
                        Conocer mi enfoque
                        <IconArrowRight />
                    </Link>
                </div>
            </div>
        </section>
    );
}
