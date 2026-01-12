import Link from "next/link";
import Image from "next/image";

const areas = [
    {
        name: "Cultura Organizacional",
        description: "Alineación de valores, comportamientos y resultados de negocio.",
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
                                display: "block",
                                position: "relative",
                                borderRadius: "1.25rem",
                                overflow: "hidden",
                                background: item.gradient,
                                border: "1px solid var(--border)",
                                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                                textDecoration: "none",
                                aspectRatio: "1",
                            }}
                            className="area-card"
                        >
                            {/* Background Image */}
                            <div
                                style={{
                                    position: "absolute",
                                    inset: 0,
                                    opacity: 0.3,
                                    transition: "opacity 0.4s ease",
                                }}
                                className="area-card-bg"
                            >
                                <Image
                                    src={item.image}
                                    alt={item.name}
                                    fill
                                    style={{ objectFit: "cover" }}
                                />
                            </div>

                            {/* Content overlay */}
                            <div
                                style={{
                                    position: "relative",
                                    zIndex: 2,
                                    height: "100%",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "flex-end",
                                    padding: "1.5rem",
                                    background: "linear-gradient(to top, rgba(13, 17, 23, 0.9) 0%, transparent 60%)",
                                }}
                            >
                                {/* Accent bar */}
                                <div
                                    style={{
                                        width: "40px",
                                        height: "3px",
                                        background: item.accentColor,
                                        borderRadius: "2px",
                                        marginBottom: "0.75rem",
                                    }}
                                />
                                <h3 className="card-title">
                                    {item.name}
                                </h3>
                                <p className="card-text">
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
