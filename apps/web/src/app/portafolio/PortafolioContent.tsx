"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { CaseVisual } from "@/components/portfolio/CaseVisual";
import { casos, Caso, CategoriaId } from "@/constants/casosData";
import {
    IconBuilding,
    IconUsers,
    IconCompass,
    IconHeart,
    IconCalendar,
    IconTarget as IconTrendingUp,
} from "@/components/ui/Icons";
import { cn } from "@/lib/utils";

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
        <div className="min-h-screen bg-background">
            {/* Header con Filtros */}
            <section className="sticky top-16 z-40 bg-background/80 backdrop-blur-md border-b border-border py-4">
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
        <div className="container flex justify-center">
            <div className="flex gap-2 p-1 rounded-full bg-muted/50 border border-border">
                {categorias.map((cat) => {
                    const isActive = activeCategory === cat.id;
                    return (
                        <button
                            key={cat.id}
                            onClick={() => onCategoryChange(cat.id)}
                            className={cn(
                                "flex items-center rounded-full transition-all duration-300 font-medium text-sm",
                                isActive ? "gap-2.5 px-6 py-2.5 text-white" : "p-2.5"
                            )}
                            style={{
                                background: isActive ? cat.color : "transparent",
                                color: isActive ? (cat.id === "Explora" ? "black" : "white") : cat.color,
                            }}
                        >
                            <span className="text-lg">{cat.icon}</span>
                            {isActive && <span>{cat.label}</span>}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

interface CaseSectionProps {
    caso: Caso;
    index: number;
}

function CaseSection({ caso, index }: CaseSectionProps) {
    const isReversed = index % 2 !== 0;

    return (
        <section className={cn("py-20 md:py-32", index === 0 && "pt-12")}>
            <div className="container">
                <div className={cn(
                    "grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center",
                    isReversed && "lg:[&>*:first-child]:order-2"
                )}>
                    {/* Contenido de texto */}
                    <div className="space-y-6">
                        {/* Tag de categoría */}
                        <div
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
                            style={{
                                border: `1px solid ${caso.color}40`,
                                background: `${caso.color}10`,
                                color: caso.color,
                            }}
                        >
                            <IconTrendingUp className="w-3 h-3" /> {caso.categoria}
                        </div>

                        <h2 className="section-title text-3xl lg:text-4xl">{caso.titulo}</h2>
                        <h3 className="text-lg text-muted-foreground">{caso.cliente}</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                            <div>
                                <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">Desafío</h4>
                                <p className="text-foreground/80 leading-relaxed">{caso.contexto} {caso.reto}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2">Solución</h4>
                                <p className="text-foreground/80 leading-relaxed">{caso.intervencion}</p>
                            </div>
                        </div>

                        {/* KPIs */}
                        <div className="flex flex-wrap gap-8 pt-6">
                            {caso.resultados.map((res, i) => (
                                <div key={i} className="text-center">
                                    <div className="text-3xl font-bold" style={{ color: caso.color }}>{res.metric}</div>
                                    <div className="text-sm text-muted-foreground mt-1">{res.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Visual */}
                    <div className="hidden lg:block">
                        <CaseVisual category={caso.categoria} color={caso.color} id={caso.id} />
                    </div>
                </div>

                {/* Visual - Mobile */}
                <div className="lg:hidden mt-8">
                    <CaseVisual category={caso.categoria} color={caso.color} id={caso.id} />
                </div>
            </div>
        </section>
    );
}

function CTASection() {
    return (
        <section className="relative py-24 md:py-32 overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />

            <div className="container relative z-10 text-center">
                <h2 className="section-title mb-6">Construyamos tu propio caso de éxito.</h2>
                <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
                    Ya sea para tu empresa, tu equipo o tu futuro profesional.
                </p>
                <Button asChild size="lg" className="shadow-lg">
                    <Link
                        href="https://wa.me/573183771838"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <IconCalendar className="w-5 h-5 mr-2" />
                        Hablemos ahora
                    </Link>
                </Button>
            </div>
        </section>
    );
}
