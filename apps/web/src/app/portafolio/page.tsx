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
}

const categorias: Categoria[] = [
    { id: "Empresas", label: "Empresas", icon: <IconBuilding /> },
    { id: "Explora", label: "Explora", icon: <IconCompass /> },
    { id: "Liderazgo", label: "Liderazgo", icon: <IconUsers /> },
    { id: "Bienestar", label: "Bienestar", icon: <IconHeart /> },
];

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function PortafolioPage() {
    const [activeCategory, setActiveCategory] = useState<CategoriaId>("Empresas");
    const filteredCases = casos.filter((c) => c.categoria === activeCategory);

    return (
        <div style={{ background: "var(--background)", minHeight: "100vh" }}>
            {/* Header con Filtros */}
            <section style={{ padding: "120px 0 40px", textAlign: "center", position: "relative" }}>
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
    const getButtonBackground = (catId: CategoriaId, isActive: boolean) => {
        if (!isActive) return "transparent";
        if (catId === "Explora") return "var(--accent)";
        if (catId === "Bienestar") return "#10b981";
        return "var(--primary)";
    };

    return (
        <div style={{
            position: "sticky",
            top: "80px",
            zIndex: 40,
            padding: "1rem 0",
            display: "flex",
            justifyContent: "center",
        }}>
            <div className="container" style={{ display: "flex", gap: "2rem", overflowX: "auto", scrollbarWidth: "none", justifyContent: "center" }}>
                <div style={{
                    display: "flex",
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid var(--border)",
                    borderRadius: "100px",
                    padding: "0.4rem",
                    gap: "0.25rem",
                    backdropFilter: "blur(10px)",
                    boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5)",
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
                                    gap: "0.5rem",
                                    padding: "0.6rem 1.5rem",
                                    borderRadius: "100px",
                                    border: "none",
                                    background: getButtonBackground(cat.id, isActive),
                                    color: isActive ? (cat.id === "Explora" ? "black" : "white") : "var(--foreground-muted)",
                                    fontSize: "0.95rem",
                                    fontWeight: isActive ? 600 : 500,
                                    cursor: "pointer",
                                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {cat.icon}
                                {cat.label}
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
            minHeight: "100vh",
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

                    <h2 style={{ fontSize: "2.5rem", marginBottom: "1rem", lineHeight: 1.2 }}>{caso.titulo}</h2>
                    <h3 style={{ fontSize: "1.25rem", fontWeight: 400, color: "var(--foreground-muted)", marginBottom: "3rem" }}>{caso.cliente}</h3>

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
                <h2 style={{ fontSize: "3rem", marginBottom: "1.5rem" }}>Construyamos tu propio caso de éxito.</h2>
                <p style={{ fontSize: "1.1rem", color: "var(--foreground-muted)", marginBottom: "3rem", maxWidth: "600px", marginInline: "auto" }}>
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
