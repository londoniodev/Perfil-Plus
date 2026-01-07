import Link from "next/link";
import Image from "next/image";
import { IconCalendar, IconArrowRight } from "../icons";

export function HeroSection() {
    return (
        <section
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "stretch",
                paddingTop: "80px",
                paddingLeft: "15%",
                paddingRight: "0",
                paddingBottom: "0",
                boxSizing: "border-box",
                overflow: "hidden",
            }}
        >
            <div
                className="grid-responsive-hero"
                style={{
                    width: "100%",
                    alignItems: "center", // Text centered vertically
                }}
            >
                <div className="animate-reveal">
                    <h1
                        className="section-title"
                        style={{
                            fontSize: "clamp(2.5rem, 5vw, 4rem)",
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

                    <div style={{ display: "flex", gap: "1rem" }}>
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
                </div>

                <div
                    className="hero-image-container"
                    style={{
                        alignSelf: "end",
                        marginBottom: "0",
                        paddingRight: "10%",
                    }}
                >
                    {/* Animated aura layers */}
                    <div className="hero-aura hero-aura-1" />
                    <div className="hero-aura hero-aura-2" />
                    <div className="hero-aura hero-aura-3" />

                    {/* Main image - 15% larger */}
                    <Image
                        src="/mauro_hero.png"
                        alt="Mauro Mera - Psicólogo y Coach"
                        width={575}
                        height={805}
                        priority
                        className="hero-image"
                        style={{
                            objectFit: "contain",
                            objectPosition: "bottom",
                            position: "relative",
                            zIndex: 2,
                            maxHeight: "calc(100vh - 80px)",
                            display: "block",
                        }}
                    />
                </div>
            </div>
        </section>
    );
}
