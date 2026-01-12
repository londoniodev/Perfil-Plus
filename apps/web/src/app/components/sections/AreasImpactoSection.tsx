import Link from "next/link";
import Image from "next/image";

const areas = [
    {
        name: "Cultura Organizacional",
        description: "Estrategia y valores, transformación cultural, experiencia del empleado y planes de acción.",
        image: "/areas_impacto/cultura_organizacional.avif",
        href: "/servicios#empresas",
        gradient: "linear-gradient(135deg, rgba(91, 141, 239, 0.15) 0%, rgba(58, 98, 184, 0.1) 100%)",
        accentColor: "rgba(91, 141, 239, 0.8)",
    },
    {
        name: "Liderazgo Consciente",
        description: "Desarrollo de líderes que inspiran y transforman equipos.",
        image: "/areas_impacto/liderazgo_consciente.avif",
        href: "/servicios#empresas",
        gradient: "linear-gradient(135deg, rgba(232, 168, 56, 0.15) 0%, rgba(200, 140, 40, 0.1) 100%)",
        accentColor: "rgba(232, 168, 56, 0.8)",
    },
    {
        name: "Orientación Vocacional y Profesional",
        description: "Claridad para decisiones de carrera sin ansiedad.",
        image: "/areas_impacto/orientacion_vocacional.avif",
        href: "/servicios#explora",
        gradient: "linear-gradient(135deg, rgba(56, 189, 189, 0.15) 0%, rgba(40, 150, 150, 0.1) 100%)",
        accentColor: "rgba(56, 189, 189, 0.8)",
    },
    {
        name: "Psicoterapia Clínica",
        description: "Espacio seguro para sanar y ordenar el mundo interno.",
        image: "/areas_impacto/psicoterapia_clinica.avif",
        href: "/servicios#psicoterapia",
        gradient: "linear-gradient(135deg, rgba(76, 175, 80, 0.15) 0%, rgba(56, 142, 60, 0.1) 100%)",
        accentColor: "rgba(76, 175, 80, 0.8)",
    },
    {
        name: "Talleres Experienciales",
        description: "Aprendizaje que se vive, no solo se entiende.",
        image: "/areas_impacto/talleres_experienciales.avif",
        href: "/servicios#empresas",
        gradient: "linear-gradient(135deg, rgba(156, 39, 176, 0.15) 0%, rgba(123, 31, 162, 0.1) 100%)",
        accentColor: "rgba(156, 39, 176, 0.8)",
    },
];

export function AreasImpactoSection() {
    return (
        <section
            style={{
                padding: "4rem 0",
                borderTop: "1px solid var(--border)",
                borderBottom: "1px solid var(--border)",
                background: "rgba(15, 20, 25, 0.4)",
                backdropFilter: "blur(5px)",
            }}
        >
            <div className="container">
                <h2
                    className="section-title"
                    style={{
                        marginBottom: "3rem",
                        textAlign: "center",
                    }}
                >
                    Áreas de impacto
                </h2>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))",
                        gap: "1.5rem",
                        maxWidth: "1400px",
                        margin: "0 auto",
                    }}
                >
                    {areas.map((item, i) => (
                        <Link
                            key={i}
                            href={item.href}
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                position: "relative",
                                borderRadius: "1.25rem",
                                overflow: "hidden",
                                border: "1px solid var(--border)",
                                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                                textDecoration: "none",
                                background: "var(--card-bg)",
                            }}
                            className="area-card"
                        >
                            {/* Image Container - 9:16 aspect ratio */}
                            <div
                                style={{
                                    position: "relative",
                                    aspectRatio: "9 / 16",
                                    width: "100%",
                                    overflow: "hidden",
                                }}
                            >
                                {/* Background Image */}
                                <Image
                                    src={item.image}
                                    alt={item.name}
                                    fill
                                    style={{
                                        objectFit: "cover",
                                        transition: "transform 0.5s ease, opacity 0.4s ease",
                                    }}
                                    className="area-card-img"
                                />

                                {/* Vignette overlay - bottom fade */}
                                <div
                                    style={{
                                        position: "absolute",
                                        inset: 0,
                                        background: `
                                            radial-gradient(ellipse at center, transparent 40%, rgba(15, 20, 25, 0.3) 100%),
                                            linear-gradient(to top, rgba(15, 20, 25, 1) 0%, rgba(15, 20, 25, 0.8) 15%, transparent 40%)
                                        `,
                                        pointerEvents: "none",
                                    }}
                                />
                            </div>

                            {/* Content Container - Solid background */}
                            <div
                                style={{
                                    position: "relative",
                                    marginTop: "-3rem",
                                    zIndex: 2,
                                    padding: "1.25rem",
                                    background: "rgba(15, 20, 25, 0.95)",
                                    backdropFilter: "blur(10px)",
                                    borderTop: `2px solid ${item.accentColor}`,
                                }}
                            >
                                <h3
                                    className="card-title"
                                    style={{
                                        fontSize: "1.1rem",
                                        marginBottom: "0.5rem",
                                    }}
                                >
                                    {item.name}
                                </h3>
                                <p
                                    className="card-text"
                                    style={{
                                        fontSize: "0.85rem",
                                        lineHeight: "1.5",
                                    }}
                                >
                                    {item.description}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section >
    );
}
