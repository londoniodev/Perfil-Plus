import Link from "next/link";
import NextImage from "next/image";
import { IconCheck, IconExternalLink } from "@/app/components/ui/Icons";
import styles from "@/app/styles/sections.module.css";

export function ServiciosSection() {
    return (
        <section className={styles.section} id="servicios">
            <div className="container">
                <div className={styles.sectionTitle}>
                    <h2 className="section-title">Rutas de acompañamiento</h2>
                    <p className={styles.sectionSubtitle}>
                        Soluciones diseñadas para tu momento actual.
                    </p>
                </div>

                <div className={styles.gridResponsive}>
                    {/* Service 1 - Psicoterapia */}
                    <div className={`card ${styles.serviceCard}`}>
                        <div className={styles.imageContainer}>
                            <NextImage
                                src="/services/psicoterapia.avif"
                                alt="Psicoterapia y Coaching"
                                fill
                                style={{ objectFit: "cover" }}
                            />
                            <div className={styles.imageOverlay} />
                        </div>
                        <div className={styles.serviceContent}>
                            <h3 className={`card-title ${styles.serviceTitle}`}>
                                Psicoterapia y Coaching personalizado
                            </h3>
                            <p className={`card-text ${styles.serviceText}`}>
                                Espacio clínico para ordenar el mundo interno y sanar.
                            </p>
                            <ul className={styles.serviceList}>
                                {["Ansiedad y estrés", "Duelo y crisis", "Vínculos sanos", "Propósito de vida"].map((item, i) => (
                                    <li key={i} className={styles.serviceItem}>
                                        <span style={{ color: "var(--success)" }}><IconCheck /></span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <div style={{ marginTop: "auto" }}>
                                <Link href="/servicios#psicoterapia" className="btn btn-secondary" style={{ width: "100%" }}>
                                    Ver detalles
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Service 2 - Consultoría (Empresas) */}
                    <div className={`card ${styles.serviceCard}`}>
                        <div className={styles.imageContainer}>
                            <NextImage
                                src="/services/consultoria.avif"
                                alt="Consultoría Organizacional"
                                fill
                                style={{ objectFit: "cover" }}
                            />
                            <div className={styles.imageOverlay} />
                        </div>
                        <div className={styles.serviceContent}>
                            <h3 className={`card-title ${styles.serviceTitle}`}>
                                Consultoría Organizacional y Experiencias de desarrollo humano
                            </h3>
                            <p className={`card-text ${styles.serviceText}`}>
                                Alineación de cultura, liderazgo y equipos con resultados de negocio.
                            </p>
                            <ul className={styles.serviceList}>
                                {["Cultura y cambio", "Escuelas de liderazgo", "Talleres de equipo", "Eventos corporativos"].map((item, i) => (
                                    <li key={i} className={styles.serviceItem}>
                                        <span style={{ color: "var(--primary)" }}><IconCheck /></span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <div style={{ marginTop: "auto" }}>
                                <Link href="/servicios#empresas" className="btn btn-secondary" style={{ width: "100%" }}>
                                    Ver detalles
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Service 3 - Orientación (Explora) */}
                    <div className={`card card-featured ${styles.serviceCard}`} style={{ overflow: "visible" }}>
                        {/* Featured Badge */}
                        <div className={styles.featuredBadge}>
                            Tecnología + IA
                        </div>

                        <div className={styles.imageContainer} style={{ borderTopLeftRadius: "inherit", borderTopRightRadius: "inherit", overflow: "hidden" }}>
                            <NextImage
                                src="/services/orientacion.avif"
                                alt="Orientación Vocacional"
                                fill
                                style={{ objectFit: "cover" }}
                            />
                            <div className={styles.imageOverlay} />
                        </div>
                        <div className={styles.serviceContent}>
                            <h3 className={`card-title ${styles.serviceTitle}`}>
                                Orientación Vocacional y Profesional
                            </h3>
                            <p className={`card-text ${styles.serviceText}`}>
                                Claridad, seguimiento y lenguaje simple para decisiones complejas.
                            </p>
                            <ul className={styles.serviceList}>
                                {["Evaluación 360° con IA", "Sesiones 1 a 1", "App de resultados", "Ruta de carrera"].map((item, i) => (
                                    <li key={i} className={styles.serviceItem}>
                                        <span style={{ color: "var(--accent)" }}><IconCheck /></span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <div style={{ marginTop: "auto" }}>
                                <Link
                                    href="https://app.universoexplora.tech"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-accent"
                                    style={{ width: "100%" }}
                                >
                                    Iniciar Explora
                                    <IconExternalLink />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
