import Link from "next/link";
import { IconCalendar, IconArrowRight } from "../icons";

export function HeroSection() {
    return (
        <section
            className="section"
            style={{
                minHeight: "90vh",
                display: "flex",
                alignItems: "center",
                paddingTop: "120px",
            }}
        >
            <div className="container grid-responsive-hero">
                <div className="animate-reveal">
                    <h1
                        className="section-title"
                        style={{
                            fontSize: "4rem",
                            marginBottom: "1.5rem",
                        }}
                    >
                        Psicología, experiencias y tecnología para transformar <br />
                        <span className="gradient-text">decisiones y cultura.</span>
                    </h1>

                    <p
                        className="section-subtitle"
                        style={{ marginBottom: "3rem" }}
                    >
                        Acompaño a personas, equipos y organizaciones a construir claridad interna y
                        resultados sostenibles, con procesos profundos y aplicables a la vida real.
                    </p>

                    <div style={{ display: "flex", gap: "1rem", marginBottom: "3rem" }}>
                        <Link
                            href="https://wa.me/573183771838?text=Hola%20Mauro,%20me%20interesa%20agendar%20una%20sesión."
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary"
                        >
                            <IconCalendar />
                            Agendar
                        </Link>
                        <Link href="#servicios" className="btn btn-secondary">
                            Ver servicios
                            <IconArrowRight />
                        </Link>
                    </div>

                    <p style={{ fontSize: "0.9rem", color: "var(--foreground-muted)", fontFamily: "var(--font-mono)" }}>
                        +10 años acompañando procesos de cambio.
                    </p>
                </div>

                <div style={{ display: "flex", justifyContent: "center", position: "relative" }}>
                    <div style={{
                        position: "absolute",
                        inset: "-20px",
                        background: "radial-gradient(circle, rgba(91,141,239,0.2) 0%, transparent 70%)",
                        filter: "blur(40px)",
                        zIndex: -1
                    }} />
                    <div
                        className="card glow-hover"
                        style={{
                            width: "400px",
                            height: "500px",
                            padding: "0",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "var(--foreground-muted)",
                            fontSize: "1rem",
                            overflow: "hidden"
                        }}
                    >
                        <div className="grid-pattern" style={{ width: "100%", height: "100%", opacity: 0.5 }}></div>
                        <span style={{ position: "absolute" }}>Foto de Mauro</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
