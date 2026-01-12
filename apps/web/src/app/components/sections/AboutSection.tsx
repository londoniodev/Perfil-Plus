import Link from "next/link";
import { IconArrowRight } from "../icons";

import ProfileCarousel from "../ProfileCarousel";

export function AboutSection() {
    return (
        <section className="section" id="quien-soy">
            <div className="container grid-responsive-profile">
                <ProfileCarousel />

                <div>
                    <h2 className="section-title">Soy Mauro Mera</h2>
                    <p
                        className="section-subtitle"
                        style={{
                            marginBottom: "1.5rem",
                        }}
                    >
                        Psicólogo, consultor organizacional y coach. Integro psicología, pedagogía
                        experiencial y herramientas digitales (incluida IA) para diseñar experiencias de
                        transformación profundas, claras y accionables.
                    </p>
                    <p
                        className="section-subtitle"
                        style={{
                            marginBottom: "2.5rem",
                        }}
                    >
                        Acompaño a personas, equipos y organizaciones a construir claridad interna y
                        resultados sostenibles, con procesos profundos y aplicables a la vida real.
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
