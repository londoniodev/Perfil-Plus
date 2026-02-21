"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { IconChevronDown } from "@alvarosky/ui";
import { cn } from "@/lib/utils";

const steps = [
    {
        num: "01",
        title: "Diagnóstico",
        description: "Entendemos el contexto, los desafíos y las oportunidades reales antes de actuar.",
        image: "/proceso/diagnostico.avif",
        accentColor: "rgba(91, 141, 239, 0.8)",
        gradient: "linear-gradient(135deg, rgba(91, 141, 239, 0.2) 0%, rgba(58, 98, 184, 0.1) 100%)",
    },
    {
        num: "02",
        title: "Diseño",
        description: "Creamos una ruta clara con metodología, tiempos y objetivos medibles.",
        image: "/proceso/diseno.avif",
        accentColor: "rgba(232, 168, 56, 0.8)",
        gradient: "linear-gradient(135deg, rgba(232, 168, 56, 0.2) 0%, rgba(200, 140, 40, 0.1) 100%)",
    },
    {
        num: "03",
        title: "Acción",
        description: "Ejecutamos el plan en la realidad con acompañamiento continuo.",
        image: "/proceso/accion.avif",
        accentColor: "rgba(255, 193, 7, 0.8)",
        gradient: "linear-gradient(135deg, rgba(255, 193, 7, 0.2) 0%, rgba(200, 150, 5, 0.1) 100%)",
    },
    {
        num: "04",
        title: "Medición",
        description: "Evaluamos resultados, ajustamos y consolidamos los aprendizajes.",
        image: "/proceso/medicion.avif",
        accentColor: "rgba(76, 175, 80, 0.8)",
        gradient: "linear-gradient(135deg, rgba(76, 175, 80, 0.2) 0%, rgba(56, 142, 60, 0.1) 100%)",
    },
];

export function MetodoSection() {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

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
                rootMargin: "-30% 0px -30% 0px"
            }
        );

        itemRefs.current.forEach((ref) => {
            if (ref) observer.observe(ref);
        });

        return () => observer.disconnect();
    }, []);

    const handleItemClick = (index: number) => {
        setActiveIndex((prev) => (prev === index ? null : index));
    };

    return (
        <section className="py-20 md:py-32 bg-background" id="metodo">
            <div className="container">
                <div className="text-center mb-16">
                    <h2 className="text-5xl md:text-6xl font-bold text-white drop-shadow-lg mb-8">El proceso</h2>
                    <p className="text-muted-foreground max-w-xl mx-auto mt-4">
                        Claridad desde el primer paso hasta el resultado.
                    </p>
                </div>

                <div className="max-w-3xl mx-auto space-y-4">
                    {steps.map((step, i) => {
                        const isActive = activeIndex === i;
                        return (
                            <div
                                key={step.num}
                                ref={(el) => { itemRefs.current[i] = el; }}
                                data-index={i}
                                onClick={() => handleItemClick(i)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault();
                                        handleItemClick(i);
                                    }
                                }}
                                aria-expanded={isActive}
                                className={cn(
                                    "relative rounded-xl overflow-hidden cursor-pointer transition-all duration-500 ease-out border",
                                    isActive ? "h-80" : "h-20"
                                )}
                                style={{
                                    background: isActive ? step.gradient : "rgba(255,255,255,0.03)",
                                    borderColor: isActive ? step.accentColor : "rgba(255,255,255,0.1)",
                                }}
                            >
                                {/* Background Image (Only visible when active) */}
                                <div className={cn(
                                    "absolute inset-0 transition-opacity duration-500",
                                    isActive ? "opacity-30" : "opacity-0"
                                )}>
                                    <Image
                                        src={step.image}
                                        alt={step.title}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                        className="object-cover"
                                    />
                                </div>

                                {/* Content Container */}
                                <div className="relative z-10 p-6 h-full flex flex-col">
                                    <div className={cn(
                                        "flex items-center justify-between",
                                        isActive && "mb-6"
                                    )}>
                                        {/* Header Row: Number + Title */}
                                        <div className="flex items-center gap-4">
                                            <div
                                                className={cn(
                                                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300",
                                                    isActive ? "text-white" : "bg-muted text-muted-foreground"
                                                )}
                                                style={{ background: isActive ? step.accentColor : undefined }}
                                            >
                                                {step.num}
                                            </div>
                                            <h3 className={cn(
                                                "text-lg font-semibold transition-colors duration-300",
                                                isActive ? "text-white" : "text-foreground"
                                            )}>
                                                {step.title}
                                            </h3>
                                        </div>

                                        {/* Expand Icon (Chevrons) */}
                                        <div className={cn(
                                            "transition-transform duration-300",
                                            isActive && "rotate-180"
                                        )}>
                                            <IconChevronDown className="text-muted-foreground" />
                                        </div>
                                    </div>

                                    {/* Description (Hidden when collapsed) */}
                                    <div className={cn(
                                        "transition-all duration-500 overflow-hidden flex-1 flex items-center",
                                        isActive ? "opacity-100" : "opacity-0"
                                    )}>
                                        <p className="text-white/90 text-lg leading-relaxed max-w-lg">
                                            {step.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

