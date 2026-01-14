"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { IconChevronDown } from "@/app/components/ui/Icons";
import styles from "@/app/styles/sections.module.css";

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
        <section className={styles.section} id="metodo">
            <div className="container">
                <div className={styles.sectionTitle}>
                    <h2 className="section-title">El proceso</h2>
                    <p className={styles.sectionSubtitle}>
                        Claridad desde el primer paso hasta el resultado.
                    </p>
                </div>

                <div className={styles.procesoContainer}>
                    {steps.map((step, i) => {
                        const isActive = activeIndex === i;
                        return (
                            <div
                                key={i}
                                ref={(el) => { itemRefs.current[i] = el; }}
                                data-index={i}
                                onClick={() => handleItemClick(i)}
                                className={`${styles.procesoCard} ${isActive ? styles.procesoCardActive : ""}`}
                                style={{
                                    background: isActive ? step.gradient : undefined,
                                    borderColor: isActive ? step.accentColor : undefined,
                                }}
                            >
                                {/* Background Image (Only visible when active) */}
                                <div className={`${styles.procesoCardBg} ${isActive ? styles.procesoCardBgActive : ""}`}>
                                    <Image
                                        src={step.image}
                                        alt={step.title}
                                        fill
                                        style={{ objectFit: "cover" }}
                                    />
                                </div>

                                {/* Content Container */}
                                <div className={`${styles.procesoContent} ${isActive ? styles.procesoContentActive : ""}`}>
                                    <div className={`${styles.cardHeader} ${isActive ? styles.cardHeaderActive : ""}`}>
                                        {/* Header Row: Number + Title */}
                                        <div className={styles.headerRow}>
                                            <div
                                                className={`${styles.numberCircle} ${isActive ? styles.numberCircleActive : ""}`}
                                                style={{ background: isActive ? step.accentColor : undefined }}
                                            >
                                                {step.num}
                                            </div>
                                            <h3 className={`${styles.cardTitle} ${isActive ? styles.cardTitleActive : ""}`}>
                                                {step.title}
                                            </h3>
                                        </div>

                                        {/* Expand Icon (Chevrons) */}
                                        <div className={`${styles.expandIcon} ${isActive ? styles.expandIconActive : ""}`}>
                                            <IconChevronDown />
                                        </div>
                                    </div>

                                    {/* Description (Hidden when collapsed) */}
                                    <div className={`${styles.descriptionBox} ${isActive ? styles.descriptionBoxActive : ""}`}>
                                        <p className={styles.descriptionText}>
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
