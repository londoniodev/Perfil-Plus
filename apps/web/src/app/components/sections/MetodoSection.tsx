"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";

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
                rootMargin: "-30% 0px -30% 0px" // Slightly wider zone to catch scroll-up easier
            }
        );

        itemRefs.current.forEach((ref) => {
            if (ref) observer.observe(ref);
        });

        return () => observer.disconnect();
    }, []);

    const handleItemClick = (index: number) => {
        // Toggle logic: if clicking active, set to null; otherwise set to index
        setActiveIndex((prev) => (prev === index ? null : index));
    };

    return (
        <section className="section" id="metodo">
            <div className="container">
                <div style={{ textAlign: "center", marginBottom: "3rem" }}>
                    <h2 className="section-title">El proceso</h2>
                    <p className="section-subtitle" style={{ margin: "0 auto" }}>
                        Claridad desde el primer paso hasta el resultado.
                    </p>
                </div>

                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "1rem",
                        maxWidth: "800px",
                        margin: "0 auto",
                    }}
                >
                    {steps.map((step, i) => {
                        const isActive = activeIndex === i;
                        return (
                            <div
                                key={i}
                                ref={(el) => { itemRefs.current[i] = el; }}
                                data-index={i}
                                onClick={() => handleItemClick(i)}
                                className="proceso-card"
                                style={{
                                    position: "relative",
                                    borderRadius: "1.25rem",
                                    overflow: "hidden",
                                    background: isActive ? step.gradient : "rgba(255, 255, 255, 0.03)", // Light bg for inactive
                                    border: isActive ? `1px solid ${step.accentColor}` : "1px solid var(--border)",
                                    transition: "all 0.5s cubic-bezier(0.25, 1, 0.5, 1)",
                                    height: isActive ? "320px" : "80px", // Collapsed vs Expanded height
                                    cursor: "pointer",
                                }}
                            >
                                {/* Background Image (Only visible when active) */}
                                <div
                                    className="proceso-card-bg"
                                    style={{
                                        position: "absolute",
                                        inset: 0,
                                        opacity: isActive ? 0.3 : 0,
                                        transition: "opacity 0.5s ease",
                                    }}
                                >
                                    <Image
                                        src={step.image}
                                        alt={step.title}
                                        fill
                                        style={{ objectFit: "cover" }}
                                    />
                                </div>

                                {/* Content Container */}
                                <div
                                    style={{
                                        position: "relative",
                                        zIndex: 2,
                                        height: "100%",
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: isActive ? "flex-end" : "center",
                                        padding: "1.5rem",
                                        // Gradient overlay for readability when active
                                        background: isActive
                                            ? "linear-gradient(to top, rgba(13, 17, 23, 0.95) 0%, rgba(13, 17, 23, 0.4) 60%, transparent 100%)"
                                            : "none",
                                    }}
                                >
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: isActive ? "1rem" : "0" }}>
                                        {/* Header Row: Number + Title */}
                                        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                            <div
                                                style={{
                                                    width: "40px",
                                                    height: "40px",
                                                    borderRadius: "50%",
                                                    background: isActive ? step.accentColor : "rgba(255, 255, 255, 0.1)",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    fontFamily: "var(--font-mono)",
                                                    fontSize: "0.9rem",
                                                    fontWeight: 700,
                                                    color: isActive ? "white" : "var(--foreground-muted)",
                                                    transition: "all 0.3s ease"
                                                }}
                                            >
                                                {step.num}
                                            </div>
                                            <h3
                                                style={{
                                                    margin: 0,
                                                    fontSize: isActive ? "1.5rem" : "1.2rem",
                                                    color: isActive ? "white" : "var(--foreground-muted)",
                                                    fontWeight: isActive ? 600 : 400,
                                                    transition: "all 0.3s ease"
                                                }}
                                            >
                                                {step.title}
                                            </h3>
                                        </div>

                                        {/* Expand Icon (Chevrons) */}
                                        <div style={{
                                            transform: isActive ? "rotate(180deg)" : "rotate(0deg)",
                                            transition: "transform 0.4s ease",
                                            color: "var(--foreground-muted)"
                                        }}>
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="6 9 12 15 18 9"></polyline>
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Description (Hidden when collapsed) */}
                                    <div
                                        style={{
                                            opacity: isActive ? 1 : 0,
                                            height: isActive ? "auto" : 0,
                                            overflow: "hidden",
                                            transition: "all 0.4s ease 0.1s"
                                        }}
                                    >
                                        <p
                                            style={{
                                                color: "var(--foreground-muted)",
                                                fontSize: "1rem",
                                                lineHeight: 1.6,
                                                margin: 0,
                                                maxWidth: "90%"
                                            }}
                                        >
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
