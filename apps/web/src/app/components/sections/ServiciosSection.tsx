import Link from "next/link";
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
                    {/* Card 1 - Empresas */}
                    <div className="card" style={{ textAlign: "center" }}>
                        <div className="icon-box" style={{ marginBottom: "1.5rem", marginInline: "auto" }}>
                            <IconBuilding />
                        </div>
                        <h3 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1rem" }}>
                            Empresas
                        </h3>
                        <p style={{ color: "var(--foreground-muted)", marginBottom: "2rem", minHeight: "3rem" }}>
                            Alineación de cultura, liderazgo y equipos con resultados de negocio.
                        </p>
                        <ul style={{ marginBottom: "2rem", display: "flex", flexDirection: "column", gap: "0.75rem", textAlign: "left" }}>
                            {["Cultura y cambio", "Escuelas de liderazgo", "Talleres de equipo"].map((item, i) => (
                                <li key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--foreground)", fontSize: "0.95rem" }}>
                                    <span style={{ color: "var(--primary)" }}><IconCheck /></span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <Link href="/servicios#empresas" className="btn btn-secondary" style={{ width: "100%" }}>
                            Ver detalles
                        </Link>
                    </div>

                    {/* Card 2 - Explora (Featured) */}
                    <div className="card card-featured" style={{ overflow: "visible", textAlign: "center" }}>
                        <div className="badge" style={{
                            position: "absolute",
                            top: "0",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            background: "var(--background)", /* Opaque background to hide border line */
                            color: "#e8a838",
                            border: "1px solid rgba(232, 168, 56, 0.3)",
                            zIndex: 10,
                            padding: "0.35rem 1rem",
                            borderRadius: "2rem",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            letterSpacing: "0.05em",
                            textTransform: "uppercase"
                        }}>
                            Destacado
                        </div>
                        <div className="icon-box icon-box-accent" style={{ marginBottom: "1.5rem", marginInline: "auto" }}>
                            <IconCompass />
                        </div>
                        <h3 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1rem" }}>
                            Explora
                        </h3>
                        <p style={{ color: "var(--foreground-muted)", marginBottom: "2rem", minHeight: "3rem" }}>
                            Orientación vocacional potenciada con IA para decisiones sin ansiedad.
                        </p>
                        <ul style={{ marginBottom: "2rem", display: "flex", flexDirection: "column", gap: "0.75rem", textAlign: "left" }}>
                            {["Evaluación 360°", "Sesiones 1 a 1", "App de resultados"].map((item, i) => (
                                <li key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--foreground)", fontSize: "0.95rem" }}>
                                    <span style={{ color: "var(--accent)" }}><IconCheck /></span>
                                    {item}
                                </li>
                            ))}
                        </ul>
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

                    {/* Card 3 - Terapia */}
                    <div className="card" style={{ textAlign: "center" }}>
                        <div className="icon-box icon-box-success" style={{ marginBottom: "1.5rem", marginInline: "auto" }}>
                            <IconHeart />
                        </div>
                        <h3 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1rem" }}>
                            Psicoterapia
                        </h3>
                        <p style={{ color: "var(--foreground-muted)", marginBottom: "2rem", minHeight: "3rem" }}>
                            Espacio clínico para ordenar el mundo interno y sanar.
                        </p>
                        <ul style={{ marginBottom: "2rem", display: "flex", flexDirection: "column", gap: "0.75rem", textAlign: "left" }}>
                            {["Ansiedad y estrés", "Duelo y crisis", "Vínculos sanos"].map((item, i) => (
                                <li key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--foreground)", fontSize: "0.95rem" }}>
                                    <span style={{ color: "var(--success)" }}><IconCheck /></span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                        <Link
                            href="/servicios#psicoterapia"
                            className="btn btn-secondary"
                            style={{ width: "100%" }}
                        >
                            Ver detalles
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
