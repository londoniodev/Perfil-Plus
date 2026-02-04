"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { Button } from "@alvarosky/ui";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";

const whatsappUrl = `https://wa.me/${siteConfig.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(siteConfig.whatsappMessage)}`;

const areas = [
    {
        name: "Cultura Organizacional",
        description: "Estrategia y valores, transformación cultural, experiencia del empleado y planes de acción.",
        image: "/areas_impacto/cultura_organizacional.avif",
        imageDesktop: "/areas_impacto/cultura_organizacional_desktop.avif",
        href: "/servicios#empresas",
        accentColor: "rgba(91, 141, 239, 0.8)",
        secondaryButton: {
            label: "Conversemos",
            href: whatsappUrl
        }
    },
    {
        name: "Liderazgo Consciente",
        description: "Desarrollo de líderes que inspiran y transforman equipos.",
        image: "/areas_impacto/liderazgo_consciente.avif",
        imageDesktop: "/areas_impacto/liderazgo_consciente_desktop.avif",
        href: "/servicios#empresas",
        accentColor: "rgba(232, 168, 56, 0.8)",
        secondaryButton: {
            label: "Conversemos",
            href: whatsappUrl
        }
    },
    {
        name: "Orientación Vocacional y Profesional",
        description: "Método validado y herramientas de IA para la exploración y elección de camino profesional con criterio y propósito.",
        image: "/areas_impacto/orientacion_vocacional.avif",
        imageDesktop: "/areas_impacto/orientacion_vocacional_desktop.avif",
        href: "/servicios#explora",
        accentColor: "rgba(56, 189, 189, 0.8)",
        secondaryButton: {
            label: "Prueba el Método",
            href: siteConfig.salesPageUrl || "/metodo"
        }
    },
    {
        name: "Psicoterapia Clínica",
        description: "Espacio seguro para sanar y ordenar el mundo interno.",
        image: "/areas_impacto/psicoterapia_clinica.avif",
        imageDesktop: "/areas_impacto/psicoterapia_clinica_desktop.avif",
        href: "/servicios#psicoterapia",
        accentColor: "rgba(76, 175, 80, 0.8)",
        secondaryButton: {
            label: "Conversemos",
            href: whatsappUrl
        }
    },
    {
        name: "Talleres Experienciales",
        description: "Aprendizaje que se vive, no solo se entiende.",
        image: "/areas_impacto/talleres_experienciales.avif",
        imageDesktop: "/areas_impacto/talleres_experienciales_desktop.avif",
        href: "/servicios#empresas",
        accentColor: "rgba(156, 39, 176, 0.8)",
        secondaryButton: {
            label: "Diagnóstico de Equipo",
            href: whatsappUrl
        }
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
        <section className="relative">
            {/* Sticky Background Container */}
            <div className="sticky top-0 h-screen w-full -z-10 bg-background">
                {areas.map((area, index) => (
                    <div
                        key={`bg-${index}`}
                        className={cn(
                            "absolute inset-0 transition-opacity duration-[2000ms]",
                            activeIndex === index ? "opacity-100 z-1" : "opacity-0 z-0"
                        )}
                    >
                        {/* Mobile Image (Vertical) */}
                        <div className="lg:hidden relative w-full h-full">
                            <Image
                                src={area.image}
                                alt={area.name}
                                fill
                                priority={index === 0}
                                unoptimized
                                className="object-cover brightness-[0.7]"
                            />
                        </div>

                        {/* Desktop Image (Horizontal) */}
                        <div className="hidden lg:block relative w-full h-full">
                            <Image
                                src={area.imageDesktop}
                                alt={area.name}
                                fill
                                priority={index === 0}
                                unoptimized
                                className="object-cover brightness-[0.7]"
                            />
                        </div>
                    </div>
                ))}

                {/* Top Gradient Blur (Entrada perfecta desde Hero) */}
                <div className="absolute top-0 left-0 right-0 h-32 md:h-64 bg-gradient-to-b from-background via-background/60 to-transparent z-10 pointer-events-none" />

                {/* Bottom Gradient Fade (Salida perfecta hacia Logos) */}
                <div className="absolute bottom-0 left-0 right-0 h-32 md:h-64 bg-gradient-to-t from-background via-background/60 to-transparent z-10 pointer-events-none" />
            </div>

            {/* Scrollable Text Content */}
            <div className="relative z-10">
                <div className="container max-w-6xl">
                    <h2 className="section-title text-center mb-12 pt-24 relative z-20 text-4xl md:text-7xl lg:text-8xl font-bold tracking-tight drop-shadow-2xl">
                        Áreas de impacto
                    </h2>

                    {areas.map((area, index) => (
                        <div
                            key={`content-${index}`}
                            ref={(el) => { sectionRefs.current[index] = el; }}
                            data-index={index}
                            className="min-h-screen flex items-center justify-center py-20"
                        >
                            <div
                                className={cn(
                                    "mx-auto text-center px-6 md:px-4 max-w-5xl transition-all duration-[2000ms]",
                                    activeIndex === index ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                                )}
                            >
                                <h3 className="text-4xl sm:text-5xl md:text-8xl font-black text-white mb-8 md:mb-12 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] leading-tight md:leading-none">
                                    {area.name}
                                </h3>

                                <p className="text-lg sm:text-xl md:text-4xl text-white mb-10 md:mb-16 leading-relaxed md:leading-normal drop-shadow-[0_5px_5px_rgba(0,0,0,0.9)] max-w-4xl mx-auto font-medium">
                                    {area.description}
                                </p>

                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <Button asChild size="lg" className="h-14 md:h-16 px-8 md:px-10 text-lg md:text-2xl bg-slate-950 hover:bg-black text-white border border-white/20 shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:scale-105 transition-all duration-300 rounded-full">
                                        <Link href={area.href}>Ver más</Link>
                                    </Button>

                                    {area.secondaryButton && (
                                        <Button asChild variant="outline" size="lg" className="h-14 md:h-16 px-8 md:px-10 text-lg md:text-2xl text-white border-white/50 hover:bg-white/10 hover:border-white shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:scale-105 transition-all duration-300 rounded-full bg-transparent">
                                            <Link href={area.secondaryButton.href} target="_blank" rel="noopener noreferrer">
                                                {area.secondaryButton.label}
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="h-[40vh]" />
                </div>
            </div>
        </section>
    );
}

