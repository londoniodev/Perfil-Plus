"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";

const areas = [
    {
        name: "Cultura Organizacional",
        description: "Estrategia y valores, transformación cultural, experiencia del empleado y planes de acción.",
        image: "/areas_impacto/cultura_organizacional.avif",
        href: "/servicios#empresas",
        accentColor: "rgba(91, 141, 239, 0.8)",
    },
    {
        name: "Liderazgo Consciente",
        description: "Desarrollo de líderes que inspiran y transforman equipos.",
        image: "/areas_impacto/liderazgo_consciente.avif",
        href: "/servicios#empresas",
        accentColor: "rgba(232, 168, 56, 0.8)",
    },
    {
        name: "Orientación Vocacional y Profesional",
        description: "Método validado y herramientas de IA para la exploración y elección de camino profesional con criterio y propósito.",
        image: "/areas_impacto/orientacion_vocacional.avif",
        href: "/servicios#explora",
        accentColor: "rgba(56, 189, 189, 0.8)",
    },
    {
        name: "Psicoterapia Clínica",
        description: "Espacio seguro para sanar y ordenar el mundo interno.",
        image: "/areas_impacto/psicoterapia_clinica.avif",
        href: "/servicios#psicoterapia",
        accentColor: "rgba(76, 175, 80, 0.8)",
    },
    {
        name: "Talleres Experienciales",
        description: "Aprendizaje que se vive, no solo se entiende.",
        image: "/areas_impacto/talleres_experienciales.avif",
        href: "/servicios#empresas",
        accentColor: "rgba(156, 39, 176, 0.8)",
    },
];

export function AreasImpactoSection() {
    const [activeIndex, setActiveIndex] = useState(0);
    const sectionRefs = useRef<(HTMLElement | null)[]>([]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const index = Number(entry.target.getAttribute("data-index"));
                        setActiveIndex(index);
                    }
                });
            },
            {
                threshold: 0.5, // Trigger when 50% of the item is visible
                rootMargin: "-10% 0px -10% 0px"
            }
        );

        sectionRefs.current.forEach((ref) => {
            if (ref) observer.observe(ref);
        });

        return () => observer.disconnect();
    }, []);

    return (
        <section style={{ position: "relative" }}>
            {/* Sticky Background Container */}
            <div
                style={{
                    position: "sticky",
                    top: 0,
                    height: "100vh",
                    width: "100%",
                    overflow: "hidden",
                    zIndex: 0,
                }}
            >
                {areas.map((area, index) => (
                    <div
                        key={`bg-${index}`}
                        style={{
                            position: "absolute",
                            inset: 0,
                            opacity: activeIndex === index ? 1 : 0,
                            transition: "opacity 0.8s ease-in-out",
                            // Ensure proper stacking context
                            zIndex: activeIndex === index ? 1 : 0
                        }}
                    >
                        <Image
                            src={area.image}
                            alt={area.name}
                            fill
                            priority={index === 0}
                            unoptimized
                            style={{
                                objectFit: "cover",
                                filter: "brightness(0.7)" // MENOS oscurecimiento (antes 0.4)
                            }}
                        />
                        {/* Removed the invasive linear gradient here */}
                    </div>
                ))}

                {/* Bottom Gradient Fade to Next Section */}
                <div style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: "150px",
                    background: "linear-gradient(to bottom, transparent, var(--background))",
                    zIndex: 2,
                    pointerEvents: "none"
                }} />
            </div>

            {/* Scrollable Text Content */}
            <div style={{ marginTop: "-100vh", position: "relative", zIndex: 1, paddingBottom: "10vh" }}>
                <div className="container" style={{ maxWidth: "1200px" }}>
                    <h2 className="section-title" style={{ textAlign: "center", marginBottom: "4rem", paddingTop: "4rem", position: "relative", zIndex: 2 }}>
                        Áreas de impacto
                    </h2>

                    {areas.map((area, index) => (
                        <div
                            key={`content-${index}`}
                            ref={(el) => { sectionRefs.current[index] = el; }}
                            data-index={index}
                            style={{
                                minHeight: "100vh",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                alignItems: "center", // Centrado horizontal
                                padding: "2rem",
                                // On mobile, we might not want full screen height if content is short, but for this effect, spacing is key.
                            }}
                        >
                            <div
                                style={{
                                    background: "rgba(15, 20, 25, 0.3)", // Ultra transparente
                                    backdropFilter: "blur(8px)", // Blur suave
                                    padding: "2rem",
                                    borderRadius: "1rem",
                                    // Removed border entirely for minimalism
                                    maxWidth: "550px",
                                    width: "100%",
                                    margin: "0 auto",
                                    textAlign: "center",
                                    transform: activeIndex === index ? "translateY(0)" : "translateY(20px)",
                                    opacity: activeIndex === index ? 1 : 0,
                                    transition: "all 0.6s ease-out 0.2s",
                                }}
                            >
                                <h3 className="card-title" style={{ fontSize: "1.8rem", color: "white", marginBottom: "0.5rem" }}>
                                    {area.name}
                                </h3>

                                {/* Minimal accent line */}
                                <div style={{ width: "40px", height: "3px", background: area.accentColor, margin: "0.5rem auto 1rem auto", borderRadius: "2px" }} />

                                <p className="card-text" style={{ fontSize: "1.05rem", color: "rgba(255, 255, 255, 0.9)", marginBottom: "1.5rem" }}>
                                    {area.description}
                                </p>
                                <Link
                                    href={area.href}
                                    className="btn btn-primary"
                                    style={{ display: "inline-flex", padding: "0.6rem 1.5rem", fontSize: "0.9rem" }}
                                >
                                    Ver más
                                </Link>
                            </div>
                        </div>
                    ))}

                    {/* Significant bottom space to fix overlap with next section's negative margin */}
                    <div style={{ height: "40vh" }} />
                </div>
            </div>
        </section>
    );
}
