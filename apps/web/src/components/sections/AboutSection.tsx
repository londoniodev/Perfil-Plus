import Link from "next/link";
import { IconArrowRight } from "@/components/ui/Icons";
import { Button } from "@/components/ui/Button";
import ProfileCarousel from "../layout/ProfileCarousel";
import styles from "@/styles/sections.module.css";

export function AboutSection() {
    return (
        <section className={`${styles.section} ${styles.aboutSection}`} id="quien-soy">
            <div className="container">
                <div className={styles.profileGrid}>
                    <ProfileCarousel />

                    <div>
                        <h2 className="section-title">Soy Mauro Mera</h2>
                        <ul className={styles.aboutList}>
                            <li>Psicólogo</li>
                            <li>Consultor Experiencial</li>
                            <li>Consultor Estratégico</li>
                            <li>Gestor de Cultura Organizacional Certificado</li>
                            <li>Entrenador de liderazgo y gestión de equipos</li>
                            <li>Orientador Vocacional y Profesional</li>
                        </ul>

                        <p className={styles.sectionSubtitle} style={{ textAlign: "left", marginBottom: "1.5rem" }}>
                            Con una trayectoria de más de 10 años, Integro la psicología, pedagogía
                            experiencial, técnicas, principios accionables y tecnología para diseñar
                            experiencias de aprendizaje, autoconocimiento y transformación del
                            potencial humano.
                        </p>
                        <p className={styles.sectionSubtitle} style={{ textAlign: "left", marginBottom: "2.5rem" }}>
                            Acompaño a adultos, jóvenes, equipos y organizaciones a construir claridad
                            interna, decisiones informadas y resultados sostenibles, con procesos
                            profundos y aplicables a la vida real.
                        </p>
                        <Button asChild variant="ghost">
                            <Link href="#metodo">
                                Conocer mi enfoque
                                <IconArrowRight />
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
