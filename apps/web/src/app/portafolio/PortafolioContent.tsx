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
    IconTrendingUp,
    IconCalendar,
} from "../components/icons/PortfolioIcons";

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
    { id: "Bienestar", label: "Bienestar", icon: <IconHeart />, color: "var(--success)" }, // Using var(--success) for consistency
];

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function PortafolioContent() {
    const [activeCategory, setActiveCategory] = useState<CategoriaId>("Empresas");
    const filteredCases = casos.filter((c) => c.categoria === activeCategory);

    // Get current color for background effect (optional, if we want to add the glow later)
    // const currentColor = categorias.find(c => c.id === activeCategory)?.color;

    return (
        <div style={{ background: "var(--background)", minHeight: "100vh" }}>
            {/* Header con Filtros */}
            <section style={{ padding: "120px 0 20px", textAlign: "center", position: "relative" }}>
                <CategoryFilterBar
                    categorias={categorias}
                    activeCategory={activeCategory}
                    onCategoryChange={setActiveCategory}
                />
            </section>

            {/* Lista de Casos */}
            <div style={{ position: "relative" }}>
                {filteredCases.map((caso, index) => (
                    <CaseSection key={caso.id} caso={caso} index={index} />
                ))}
            </div>

            {/* Call to Action Final */}
            <CTASection />

            {/* CSS Responsivo */}
            <style>{`
                @media (max-width: 768px) {
                    .grid-responsive-portfolio {
                        grid-template-columns: 1fr !important;
                        gap: 2rem !important;
                    }
                    .hidden-on-mobile {
                        display: none !important;
                    }
                    .show-on-mobile {
                        display: block !important;
                    }
                }
                @media (min-width: 769px) {
                    .show-on-mobile {
                        display: none !important;
                    }
                }
            `}</style>
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
        <div style={{
            position: "sticky",
            top: "80px",
            zIndex: 40,
            padding: "1rem 1.5rem", // Horizontal padding for mobile
            display: "flex",
            justifyContent: "center",
        }}>
            <div className="container" style={{
                display: "flex",
                justifyContent: "center",
                width: "100%",
                maxWidth: "1400px",
                margin: "0 auto"
            }}>
                <div style={{
                    display: "flex",
                    background: "rgba(10, 14, 20, 0.6)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "100px",
                    padding: "0.3rem",
                    gap: "0.5rem",
                    backdropFilter: "blur(12px)",
                    boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5)",
                    overflowX: "auto",
                    maxWidth: "100%",
                    scrollbarWidth: "none"
                }}>
                    {categorias.map((cat) => {
                        const isActive = activeCategory === cat.id;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => onCategoryChange(cat.id)}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: isActive ? "0.6rem" : "0",
                                    padding: isActive ? "0.7rem 1.5rem" : "0.7rem", // Circle when inactive, Pill when active
                                    borderRadius: "100px",
                                    border: "none",
                                    background: isActive ? cat.color : "transparent",
                                    color: isActive ? (cat.id === "Explora" ? "black" : "white") : cat.color,
                                    cursor: "pointer",
                                    transition: "all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)",
                                    fontSize: "0.95rem",
                                    fontWeight: 600,
                                    minWidth: isActive ? "auto" : "3.2rem", // Ensure circle shape
                                }}
                            >
                                <span style={{ fontSize: "1.2rem", display: "flex" }}>{cat.icon}</span>

                                {/* Text Label - Only visible when active */}
                                <span style={{
                                    maxWidth: isActive ? "200px" : "0",
                                    overflow: "hidden",
                                    whiteSpace: "nowrap",
                                    opacity: isActive ? 1 : 0,
                                    transition: "all 0.4s ease",
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
        <section style={{
            minHeight: index === 0 ? "calc(100vh - 200px)" : "100vh", // Reduced height for first section to pull content up
            display: "flex",
            alignItems: "center",
            borderBottom: "1px solid var(--border)",
            position: "relative",
        }}>
            <div
                className="container grid-responsive-portfolio"
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "4rem",
                    width: "100%",
                    alignItems: "center",
                }}
            >
                {/* Contenido de texto */}
                <div style={{ order: index % 2 === 0 ? 1 : 2, padding: "4rem 0" }}>
                    {/* Tag de categoría */}
                    <div style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.5rem 1rem",
                        borderRadius: "100px",
                        border: `1px solid ${caso.color}40`,
                        background: `${caso.color}10`,
                        color: caso.color,
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        marginBottom: "2rem",
                    }}>
                        <IconTrendingUp /> {caso.categoria}
                    </div>

                    <h2 className="section-title" style={{ marginBottom: "1rem", lineHeight: 1.2 }}>{caso.titulo}</h2>
                    <h3 className="section-subtitle" style={{ marginBottom: "3rem" }}>{caso.cliente}</h3>

                    <div style={{ display: "grid", gap: "2rem", marginBottom: "3rem" }}>
                        <div>
                            <h4 style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--foreground-muted)", marginBottom: "0.5rem" }}>Desafío</h4>
                            <p style={{ lineHeight: 1.6 }}>{caso.contexto} {caso.reto}</p>
                        </div>
                        <div>
                            <h4 style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--foreground-muted)", marginBottom: "0.5rem" }}>Solución</h4>
                            <p style={{ lineHeight: 1.6 }}>{caso.intervencion}</p>
                        </div>
                    </div>

                    {/* KPIs */}
                    <div style={{ display: "flex", gap: "2rem", paddingTop: "2rem", borderTop: "1px solid var(--border)" }}>
                        {caso.resultados.map((res, i) => (
                            <div key={i}>
                                <div style={{ fontSize: "2rem", fontWeight: 700, color: caso.color }}>{res.metric}</div>
                                <div style={{ fontSize: "0.75rem", color: "var(--foreground-muted)" }}>{res.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Visual - Desktop */}
                <div
                    className="hidden-on-mobile"
                    style={{
                        order: index % 2 === 0 ? 2 : 1,
                        height: "80vh",
                        position: "sticky",
                        top: "10vh",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <CaseVisual category={caso.categoria} color={caso.color} id={caso.id} />
                </div>

                {/* Visual - Mobile */}
                <div className="show-on-mobile" style={{ order: 3, height: "300px", width: "100%", marginTop: "2rem" }}>
                    <CaseVisual category={caso.categoria} color={caso.color} id={caso.id} />
                </div>
            </div>
        </section>
    );
}

function CTASection() {
    return (
        <section style={{ padding: "10rem 0", textAlign: "center", position: "relative", overflow: "hidden" }}>
            <div style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "600px",
                height: "600px",
                background: "radial-gradient(circle, rgba(58, 98, 184, 0.15) 0%, transparent 70%)",
                borderRadius: "50%",
                filter: "blur(100px)",
                zIndex: -1,
            }} />

            <div className="container">
                <h2 className="section-title" style={{ marginBottom: "1.5rem" }}>Construyamos tu propio caso de éxito.</h2>
                <p className="section-subtitle" style={{ marginBottom: "3rem", maxWidth: "600px", marginInline: "auto" }}>
                    Ya sea para tu empresa, tu equipo o tu futuro profesional.
                </p>
                <Link
                    href="https://wa.me/573183771838"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                    style={{ padding: "1rem 2rem", fontSize: "1.1rem" }}
                >
                    <IconCalendar />
                    Hablemos ahora
                </Link>
            </div>
        </section>
    );
}
