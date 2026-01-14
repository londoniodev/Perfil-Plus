"use client";

import { useState } from "react";
import Link from "next/link";
import { CaseVisual } from "../components/portfolio/CaseVisual";
import { casos, Caso, CategoriaId } from "../data/casosData";
import {
    IconBuilding,
    IconUsers,
    IconCompass,
    IconHeart,
    IconCalendar,
} from "../components/ui/Icons";
import styles from "@/app/styles/portfolio.module.css";
// IconTrendingUp is not in Icons.tsx, we can use IconActivity or IconTrendingUp if added, or IconZap.
// Let's use IconActivity as "Trending" or just import from Icons if available.
// Looking at Icons.tsx, FiActivity is aliased as IconBrain.
// We can use IconBriefcase or similar, or just IconActivity.
// Let's check Icons.tsx again. It has IconTarget.
// Let's use IconActivity directly if possible, or add it, or use IconZap.
// I will use IconZap for now as "Impact/Trend" or assume IconTrendingUp will be added/aliased.
// Actually, let's use a generic icon or just IconActivity (Brain).
// Wait, I can import { FiTrendingUp } from "react-icons/fi" inside Icons.tsx or just use what I have.
// I'll stick to Icons.tsx exports. I'll use IconActivity for "Trending" context if sensible, or IconTarget.
// Actually, `IconTrendingUp` was used for the category tag.
// I'll use `IconTarget` instead for now to stay safe with existing exports.

import { IconTarget as IconTrendingUp } from "../components/ui/Icons";

// ============================================================================
// DATOS DE CATEGORÍAS
// ============================================================================

interface Categoria {
    id: CategoriaId;
    label: string;
    icon: React.ReactNode;
    color: string;
}

const categorias: Categoria[] = [
    { id: "Empresas", label: "Empresas", icon: <IconBuilding />, color: "var(--primary)" },
    { id: "Explora", label: "Explora", icon: <IconCompass />, color: "var(--accent)" },
    { id: "Liderazgo", label: "Liderazgo", icon: <IconUsers />, color: "#9c27b0" },
    { id: "Bienestar", label: "Bienestar", icon: <IconHeart />, color: "var(--success)" },
];

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function PortafolioContent() {
    const [activeCategory, setActiveCategory] = useState<CategoriaId>("Empresas");
    const filteredCases = casos.filter((c) => c.categoria === activeCategory);

    return (
        <div className={styles.portfolioPage}>
            {/* Header con Filtros */}
            <section className={styles.filtersSection}>
                <CategoryFilterBar
                    categorias={categorias}
                    activeCategory={activeCategory}
                    onCategoryChange={setActiveCategory}
                />
            </section>

            {/* Lista de Casos */}
            <div>
                {filteredCases.map((caso, index) => (
                    <CaseSection key={caso.id} caso={caso} index={index} />
                ))}
            </div>

            {/* Call to Action Final */}
            <CTASection />
        </div>
    );
}

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

interface CategoryFilterBarProps {
    categorias: Categoria[];
    activeCategory: CategoriaId;
    onCategoryChange: (category: CategoriaId) => void;
}

function CategoryFilterBar({ categorias, activeCategory, onCategoryChange }: CategoryFilterBarProps) {
    return (
        <div className={styles.filterBar}>
            <div className={styles.filterContainer}>
                <div className={styles.filterScroll}>
                    {categorias.map((cat) => {
                        const isActive = activeCategory === cat.id;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => onCategoryChange(cat.id)}
                                className={styles.filterButton}
                                style={{
                                    gap: isActive ? "0.6rem" : "0",
                                    padding: isActive ? "0.7rem 1.5rem" : "0.7rem",
                                    background: isActive ? cat.color : "transparent",
                                    color: isActive ? (cat.id === "Explora" ? "black" : "white") : cat.color,
                                    minWidth: isActive ? "auto" : "3.2rem",
                                }}
                            >
                                <span className={styles.filterIcon}>{cat.icon}</span>

                                {/* Text Label - Only visible when active */}
                                <span className={styles.filterLabel} style={{
                                    maxWidth: isActive ? "200px" : "0",
                                    opacity: isActive ? 1 : 0,
                                }}>
                                    {cat.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

interface CaseSectionProps {
    caso: Caso;
    index: number;
}

function CaseSection({ caso, index }: CaseSectionProps) {
    return (
        <section className={`${styles.caseSection} ${index === 0 ? styles.caseSectionFirst : ''}`}>
            <div className={`container ${styles.caseContainer}`}>
                {/* Contenido de texto */}
                <div className={styles.caseContent} style={{ order: index % 2 === 0 ? 1 : 2 }}>
                    {/* Tag de categoría */}
                    <div className={styles.caseTag} style={{
                        border: `1px solid ${caso.color}40`,
                        background: `${caso.color}10`,
                        color: caso.color,
                    }}>
                        <IconTrendingUp /> {caso.categoria}
                    </div>

                    <h2 className={`section-title ${styles.caseTitle}`}>{caso.titulo}</h2>
                    <h3 className={`section-subtitle ${styles.caseSubtitle}`}>{caso.cliente}</h3>

                    <div className={styles.challengeSolutionGrid}>
                        <div>
                            <h4 className={styles.sectionHeadingSmall}>Desafío</h4>
                            <p className={styles.textBody}>{caso.contexto} {caso.reto}</p>
                        </div>
                        <div>
                            <h4 className={styles.sectionHeadingSmall}>Solución</h4>
                            <p className={styles.textBody}>{caso.intervencion}</p>
                        </div>
                    </div>

                    {/* KPIs */}
                    <div className={styles.kpiContainer}>
                        {caso.resultados.map((res, i) => (
                            <div key={i} className={styles.kpiItem}>
                                <div className={styles.kpiMetric} style={{ color: caso.color }}>{res.metric}</div>
                                <div className={styles.kpiLabel}>{res.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Visual - Desktop */}
                <div
                    className={styles.visualDesktop}
                    style={{
                        order: index % 2 === 0 ? 2 : 1,
                    }}
                >
                    <CaseVisual category={caso.categoria} color={caso.color} id={caso.id} />
                </div>

                {/* Visual - Mobile */}
                <div className={styles.visualMobile}>
                    <CaseVisual category={caso.categoria} color={caso.color} id={caso.id} />
                </div>
            </div>
        </section>
    );
}

function CTASection() {
    return (
        <section className={styles.ctaSection}>
            <div className={styles.ctaGlow} />

            <div className="container">
                <h2 className="section-title" style={{ marginBottom: "1.5rem" }}>Construyamos tu propio caso de éxito.</h2>
                <p className={`section-subtitle ${styles.ctaSubtitle}`}>
                    Ya sea para tu empresa, tu equipo o tu futuro profesional.
                </p>
                <Link
                    href="https://wa.me/573183771838"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                    style={{ padding: "1rem 2rem", fontSize: "1.1rem" }}
                >
                    <IconCalendar className="w-5 h-5 mr-2" />
                    Hablemos ahora
                </Link>
            </div>
        </section>
    );
}
