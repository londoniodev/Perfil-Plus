"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import styles from "@/styles/sections.module.css";

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
                threshold: 0.5,
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
            <div className={styles.stickyContainer}>
                {areas.map((area, index) => (
                    <div
                        key={`bg-${index}`}
                        className={styles.stickyBg}
                        style={{
                            opacity: activeIndex === index ? 1 : 0,
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
                                filter: "brightness(0.7)"
                            }}
                        />
                    </div>
                ))}

                {/* Bottom Gradient Fade */}
                <div className={styles.stickyOverlay} />
            </div>

            {/* Scrollable Text Content */}
            <div className={styles.scrollContent}>
                <div className="container" style={{ maxWidth: "1200px" }}>
                    <h2 className="section-title" style={{ textAlign: "center", marginBottom: "4rem", paddingTop: "4rem", position: "relative", zIndex: 2 }}>
                        Áreas de impacto
                    </h2>

                    {areas.map((area, index) => (
                        <div
                            key={`content-${index}`}
                            ref={(el) => { sectionRefs.current[index] = el; }}
                            data-index={index}
                            className={styles.areaCardContainer}
                        >
                            <Card
                                className="bg-black/40 backdrop-blur-md border border-white/10 mx-auto text-center px-8 py-12 max-w-[600px] shadow-2xl transition-all duration-700 w-full"
                                style={{
                                    transform: activeIndex === index ? "translateY(0)" : "translateY(40px)",
                                    opacity: activeIndex === index ? 1 : 0,
                                }}
                            >
                                <h3 className="text-3xl font-bold text-white mb-4">
                                    {area.name}
                                </h3>

                                <div
                                    className="w-16 h-1 mx-auto mb-6 rounded-full"
                                    style={{ background: area.accentColor }}
                                />

                                <p className="text-lg text-white/90 mb-8 leading-relaxed">
                                    {area.description}
                                </p>
                                <Button asChild size="lg" className="shadow-lg">
                                    <Link href={area.href}>Ver más</Link>
                                </Button>
                            </Card>
                        </div>
                    ))}

                    <div style={{ height: "40vh" }} />
                </div>
            </div>
        </section>
    );
}
