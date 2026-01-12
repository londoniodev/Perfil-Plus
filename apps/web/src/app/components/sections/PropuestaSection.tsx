import Link from "next/link";
import Image from "next/image";
import { IconBrain, IconSparkles, IconCpu } from "../icons";

const pillars = [
    {
        icon: <IconBrain />,
        title: "Psicología aplicada",
        desc: "Comprender lo que pasa adentro para actuar mejor afuera.",
        image: "/propuesta/propuesta_psychology.png",
        accent: "rgba(91, 141, 239, 1)", // Blue
        gradient: "linear-gradient(135deg, rgba(91, 141, 239, 0.2) 0%, rgba(58, 98, 184, 0.1) 100%)",
    },
    {
        icon: <IconSparkles />,
        title: "Experiencias educativas para las organizaciones",
        desc: "Talleres y programas vivenciales para el desarrollo de habilidades y competencias.",
        image: "/propuesta/propuesta_education.png",
        accent: "rgba(232, 168, 56, 1)", // Gold/Orange
        gradient: "linear-gradient(135deg, rgba(232, 168, 56, 0.2) 0%, rgba(200, 140, 40, 0.1) 100%)",
    },
    {
        icon: <IconCpu />,
        title: "Tecnología e IA",
        desc: "Claridad, seguimiento y lenguaje simple para decisiones complejas.",
        image: "/propuesta/propuesta_tech.png",
        accent: "rgba(56, 189, 189, 1)", // Cyan/Teal
        gradient: "linear-gradient(135deg, rgba(56, 189, 189, 0.2) 0%, rgba(40, 150, 150, 0.1) 100%)",
    },
];

export function PropuestaSection() {
    return (
        <section className="section">
            <div className="container">
                <div style={{ textAlign: "center", marginBottom: "5rem" }}>
                    <h2 className="section-title">Lo humano y lo medible</h2>
                    <p className="section-subtitle" style={{ margin: "0 auto" }}>
                        Decisiones conscientes, cultura plena, desarrollo del talento, autoconocimiento y salud mental.
                    </p>
                </div>

                <div className="grid-responsive">
                    {pillars.map((item, i) => (
                        <div
                            key={i}
                            className="card glow-hover"
                            style={{
                                textAlign: "center",
                                position: "relative",
                                overflow: "hidden",
                                padding: "2.5rem 1.5rem",
                                borderRadius: "1.5rem",
                                border: "1px solid rgba(255, 255, 255, 0.08)",
                                background: "rgba(10, 14, 20, 0.6)", // Darker base for glass
                                isolation: "isolate",
                            }}
                        >
                            {/* Abstract Background Image */}
                            <div
                                style={{
                                    position: "absolute",
                                    inset: 0,
                                    zIndex: -1,
                                    opacity: 0.25,
                                    transition: "opacity 0.4s ease, transform 0.4s ease",
                                }}
                                className="card-bg-animation"
                            >
                                <Image
                                    src={item.image}
                                    alt=""
                                    fill
                                    sizes="(max-width: 768px) 100vw, 400px"
                                    loading="lazy"
                                    unoptimized
                                    style={{
                                        objectFit: "cover",
                                        mixBlendMode: "screen",
                                    }}
                                />
                                {/* Gradient Overlay for better text readability */}
                                <div
                                    style={{
                                        position: "absolute",
                                        inset: 0,
                                        background: `linear-gradient(to bottom, rgba(15, 20, 25, 0.8) 0%, rgba(15, 20, 25, 0.95) 100%)`,
                                    }}
                                />
                            </div>

                            {/* Icon Container */}
                            <div
                                className="icon-box"
                                style={{
                                    margin: "0 auto 1.5rem",
                                    color: item.accent,
                                    background: item.gradient,
                                    borderRadius: "1rem",
                                    width: "60px",
                                    height: "60px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    border: `1px solid ${item.accent}30`,
                                    boxShadow: `0 0 20px ${item.accent}15`,
                                    fontSize: "1.75rem",
                                }}
                            >
                                {item.icon}
                            </div>

                            <h3
                                className="card-title"
                                style={{
                                    fontSize: "1.25rem",
                                    marginBottom: "1rem",
                                }}
                            >
                                {item.title}
                            </h3>
                            <p
                                className="card-text"
                                style={{
                                    fontSize: "0.95rem",
                                    color: "var(--foreground-muted)",
                                    lineHeight: 1.6,
                                }}
                            >
                                {item.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
