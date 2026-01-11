import Link from "next/link";
import NextImage from "next/image";
import { IconBuilding, IconCompass, IconHeart, IconCheck, IconExternalLink } from "../icons";

export function ServiciosSection() {
    return (
        <section className="section" id="servicios">
            <div className="container">
                <div style={{ textAlign: "center", marginBottom: "5rem" }}>
                    <h2 className="section-title">Rutas de acompañamiento</h2>
                    <p className="section-subtitle" style={{ margin: "0 auto" }}>
                        Soluciones diseñadas para tu momento actual.
                    </p>
                </div>

                <div className="grid-responsive">
                    {/* Service 1 - Psicoterapia */}
                    <div className="card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                        <div style={{ position: "relative", height: "240px", width: "100%" }}>
                            <NextImage
                                src="/services/psicoterapia.avif"
                                alt="Psicoterapia y Coaching"
                                fill
                                style={{ objectFit: "cover" }}
                            />
                            <div style={{
                                position: "absolute",
                                inset: 0,
                                background: "linear-gradient(to top, rgba(16, 16, 28, 0.8), transparent)"
                            }} />
                        </div>
                        <div style={{ padding: "2rem", flex: 1, display: "flex", flexDirection: "column" }}>
                            <h3 style={{ fontSize: "1.35rem", fontWeight: 700, marginBottom: "1rem", lineHeight: 1.3 }}>
                                Psicoterapia y Coaching personalizado
                            </h3>
                            <p style={{ color: "var(--foreground-muted)", marginBottom: "1.5rem", fontSize: "0.95rem" }}>
                                Espacio clínico para ordenar el mundo interno y sanar.
                            </p>
                            <ul style={{ marginBottom: "2rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                {["Ansiedad y estrés", "Duelo y crisis", "Vínculos sanos", "Propósito de vida"].map((item, i) => (
                                    <li key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem" }}>
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
                    <div className="card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                        <div style={{ position: "relative", height: "240px", width: "100%" }}>
                            <NextImage
                                src="/services/consultoria.avif"
                                alt="Consultoría Organizacional"
                                fill
                                style={{ objectFit: "cover" }}
                            />
                            <div style={{
                                position: "absolute",
                                inset: 0,
                                background: "linear-gradient(to top, rgba(16, 16, 28, 0.8), transparent)"
                            }} />
                        </div>
                        <div style={{ padding: "2rem", flex: 1, display: "flex", flexDirection: "column" }}>
                            <h3 style={{ fontSize: "1.35rem", fontWeight: 700, marginBottom: "1rem", lineHeight: 1.3 }}>
                                Consultoría Organizacional y Experiencias de desarrollo humano
                            </h3>
                            <p style={{ color: "var(--foreground-muted)", marginBottom: "1.5rem", fontSize: "0.95rem" }}>
                                Alineación de cultura, liderazgo y equipos con resultados de negocio.
                            </p>
                            <ul style={{ marginBottom: "2rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                {["Cultura y cambio", "Escuelas de liderazgo", "Talleres de equipo", "Eventos corporativos"].map((item, i) => (
                                    <li key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem" }}>
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
                    <div className="card card-featured" style={{ padding: 0, overflow: "visible", display: "flex", flexDirection: "column" }}>
                        {/* Featured Badge */}
                        <div className="badge" style={{
                            position: "absolute",
                            top: "-12px",
                            left: "50%",
                            transform: "translateX(-50%)",
                            background: "var(--background)",
                            color: "#e8a838",
                            border: "1px solid rgba(232, 168, 56, 0.3)",
                            zIndex: 20,
                            padding: "0.35rem 1rem",
                            borderRadius: "2rem",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            letterSpacing: "0.05em",
                            textTransform: "uppercase",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                        }}>
                            Tecnología + IA
                        </div>

                        <div style={{ position: "relative", height: "240px", width: "100%", borderTopLeftRadius: "inherit", borderTopRightRadius: "inherit", overflow: "hidden" }}>
                            <NextImage
                                src="/services/orientacion.avif"
                                alt="Orientación Vocacional"
                                fill
                                style={{ objectFit: "cover" }}
                            />
                            <div style={{
                                position: "absolute",
                                inset: 0,
                                background: "linear-gradient(to top, rgba(16, 16, 28, 0.8), transparent)"
                            }} />
                        </div>
                        <div style={{ padding: "2rem", flex: 1, display: "flex", flexDirection: "column" }}>
                            <h3 style={{ fontSize: "1.35rem", fontWeight: 700, marginBottom: "1rem", lineHeight: 1.3 }}>
                                Orientación vocacional y Profesional con TecnologIA
                            </h3>
                            <p style={{ color: "var(--foreground-muted)", marginBottom: "1.5rem", fontSize: "0.95rem" }}>
                                Claridad, seguimiento y lenguaje simple para decisiones complejas.
                            </p>
                            <ul style={{ marginBottom: "2rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                {["Evaluación 360° con IA", "Sesiones 1 a 1", "App de resultados", "Ruta de carrera"].map((item, i) => (
                                    <li key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem" }}>
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
