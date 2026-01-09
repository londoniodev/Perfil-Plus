"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { CaseVisual } from "../components/portfolio/CaseVisual";

// --- Icons ---
const IconBuilding = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
        <line x1="9" y1="22" x2="9" y2="22.01" />
        <line x1="15" y1="22" x2="15" y2="22.01" />
        <line x1="12" y1="22" x2="12" y2="22.01" />
        <line x1="12" y1="2" x2="12" y2="22" />
        <line x1="4" y1="10" x2="20" y2="10" />
    </svg>
);

const IconUsers = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

const IconCompass = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
);

const IconHeart = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
);

const IconTrendingUp = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
    </svg>
);

const IconArrowRight = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
);

const IconCalendar = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);

// --- Data ---
const casos = [
    {
        id: 1,
        titulo: "Programa de cultura y liderazgo",
        cliente: "Empresa del sector financiero",
        categoria: "Empresas",
        color: "var(--primary)", // Blue
        contexto: "Una empresa de 500+ empleados enfrentaba desalineación entre la estrategia de crecimiento y la cultura interna.",
        reto: "Alinear la cultura organizacional con los objetivos estratégicos y desarrollar habilidades de liderazgo.",
        intervencion: "Diagnóstico de cultura de 4 semanas, programa de desarrollo de 6 meses con talleres mensuales.",
        resultados: [
            { metric: "85%", label: "Mejora clima" },
            { metric: "30%", label: "Menor rotación" },
            { metric: "100%", label: "Líderes activos" },
        ],
    },
    {
        id: 101,
        titulo: "Cultura de servicio al cliente",
        cliente: "Retail y Moda",
        categoria: "Empresas",
        color: "var(--primary)",
        contexto: "La marca creció rápido pero la experiencia en tienda se volvió inconsistente.",
        reto: "Estandarizar el modelo de servicio sin perder la autenticidad de cada asesor.",
        intervencion: "Diseño de protocolo de servicio + Escuela de anfitriones para 120 colaboradores.",
        resultados: [
            { metric: "+15%", label: "Ticket promedio" },
            { metric: "9.2/10", label: "NPS Cliente" },
            { metric: "Zero", label: "Quejas graves" },
        ],
    },
    {
        id: 102,
        titulo: "Fusión cultural post-adquisición",
        cliente: "Sector Tecnológico",
        categoria: "Empresas",
        color: "var(--primary)",
        contexto: "Dos empresas de software se fusionaron con estilos de trabajo opuestos (ágil vs tradicional).",
        reto: "Crear una nueva identidad cultural compartida y reducir la fricción operativa.",
        intervencion: "Talleres de alineación de valores + Coaching a equipo directivo + Embajadores culturales.",
        resultados: [
            { metric: "100%", label: "Visión unificada" },
            { metric: "Baja", label: "Fuga de talento" },
            { metric: "Rápida", label: "Integración" },
        ],
    },
    {
        id: 103,
        titulo: "Liderazgo para la innovación",
        cliente: "Laboratorio Farmacéutico",
        categoria: "Empresas",
        color: "var(--primary)",
        contexto: "Necesidad de agilizar la toma de decisiones y fomentar la innovación en mandos medios.",
        reto: "Romper silos y empoderar a los líderes para proponer mejoras.",
        intervencion: "Hackathon de soluciones internas + Programa de liderazgo adaptativo.",
        resultados: [
            { metric: "12", label: "Proyectos nuevos" },
            { metric: "40%", label: "Más agilidad" },
            { metric: "Alta", label: "Participación" },
        ],
    },
    {
        id: 2,
        titulo: "Proceso Explora institucional",
        cliente: "Institución educativa",
        categoria: "Explora",
        color: "var(--accent)", // Amber
        contexto: "Colegio con alta ansiedad vocacional en estudiantes de último año, buscando modernizar su departamento de psicología.",
        reto: "Implementar un proceso de orientación vocacional escalable que integrara tecnología y acompañamiento humano.",
        intervencion: "Piloto con 60 estudiantes: evaluaciones, sesiones 1:1, app con IA, talleres con padres.",
        resultados: [
            { metric: "92%", label: "Satisfacción familias" },
            { metric: "80%", label: "Decisión segura" },
            { metric: "Perm.", label: "Programa adoptado" },
        ],
    },
    {
        id: 3,
        titulo: "Transformación de mandos medios",
        cliente: "Empresa de manufactura",
        categoria: "Liderazgo",
        color: "var(--success)", // Cyan/Green variant if defined, using primary-light logic
        contexto: "Supervisores promovidos por su excelente desempeño técnico, pero sin formación en gestión de personas, generando conflictos.",
        reto: "Desarrollar competencias de liderazgo, comunicación asertiva y resolución de conflictos en 25 supervisores de planta.",
        intervencion: "Programa de 8 meses: taller mensual + coaching grupal + herramientas prácticas de gestión diaria.",
        resultados: [
            { metric: "40%", label: "Menos conflictos" },
            { metric: "4.5/5", label: "Evaluación desempeño" },
            { metric: "25", label: "Líderes formados" },
        ],
    },
    {
        id: 6,
        titulo: "Taller de bienestar y propósito",
        cliente: "Equipo directivo de ONG",
        categoria: "Bienestar",
        color: "#10b981", // Emerald
        contexto: "Equipo de alto rendimiento con síntomas claros de burnout y desconexión con el propósito original de la organización.",
        reto: "Reconectar al equipo con el impacto de su trabajo y establecer límites saludables de desconexión.",
        intervencion: "Retiro inmersivo de 2 días con metodología experiencial + seguimiento de 3 meses para sostener hábitos.",
        resultados: [
            { metric: "12", label: "Directivos renovados" },
            { metric: "100%", label: "Acuerdos de equipo" },
            { metric: "0", label: "Burnout reportado" },
        ],
    },
    {
        id: 5,
        titulo: "Proceso Explora familiar",
        cliente: "Familia (caso anónimo)",
        categoria: "Explora",
        color: "var(--accent)",
        contexto: "Joven de 17 años bloqueado en su decisión de carrera, con mucha presión familiar y miedo a equivocarse.",
        reto: "Clarificar perfil vocacional separando intereses genuinos de expectativas externas.",
        intervencion: "5 sesiones individuales + 2 familiares + app IA + informe final de ruta de carrera.",
        resultados: [
            { metric: "3", label: "Opciones claras" },
            { metric: "Bajó", label: "Nivel de ansiedad" },
            { metric: "100%", label: "Alineación familiar" },
        ],
    },

];

const categorias = [
    { id: "Empresas", label: "Empresas", icon: <IconBuilding /> },
    { id: "Explora", label: "Explora", icon: <IconCompass /> },
    { id: "Liderazgo", label: "Liderazgo", icon: <IconUsers /> },
    { id: "Bienestar", label: "Bienestar", icon: <IconHeart /> }
];

export default function PortafolioPage() {
    const [activeCategory, setActiveCategory] = useState("Empresas");

    // Filter logic
    const filteredCases = casos.filter(c => c.categoria === activeCategory);

    return (
        <div style={{ background: "var(--background)", minHeight: "100vh" }}>

            {/* Header / Hero Minimalista */}
            <section style={{
                padding: "120px 0 40px",
                textAlign: "center",
                position: "relative"
            }}>

                {/* Floating Filters Sticky Bar */}
                <div style={{
                    position: "sticky",
                    top: "80px", // Below navbar
                    zIndex: 40,
                    padding: "1rem 0",
                    display: "flex",
                    justifyContent: "center"
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
                            boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5)"
                        }}>
                            {categorias.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "0.5rem",
                                        padding: "0.6rem 1.5rem",
                                        borderRadius: "100px",
                                        border: "none",
                                        background: activeCategory === cat.id ? (cat.id === "Explora" ? "var(--accent)" : cat.id === "Bienestar" ? "#10b981" : "var(--primary)") : "transparent",
                                        color: activeCategory === cat.id ? (cat.id === "Explora" ? "black" : "white") : "var(--foreground-muted)",
                                        fontSize: "0.95rem",
                                        fontWeight: activeCategory === cat.id ? 600 : 500,
                                        cursor: "pointer",
                                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                        whiteSpace: "nowrap"
                                    }}
                                >
                                    {cat.icon}
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Sticky Scrolling Layout */}
            <div style={{ position: "relative" }}>
                {filteredCases.map((caso, index) => (
                    <section key={caso.id} style={{
                        minHeight: "100vh",
                        display: "flex",
                        alignItems: "center",
                        borderBottom: "1px solid var(--border)",
                        position: "relative"
                    }}>

                        {/* Use CSS Grid for Desktop, Block for Mobile */}
                        <div className="container grid-responsive-portfolio" style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "4rem",
                            width: "100%",
                            alignItems: "center" // Vertically center content
                        }}>

                            {/* Text Content Column - Order flips based on index */}
                            <div style={{
                                order: index % 2 === 0 ? 1 : 2,
                                padding: "4rem 0"
                            }}>
                                {/* Tag */}
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
                                    marginBottom: "2rem"
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
                                <div style={{
                                    display: "flex",
                                    gap: "2rem",
                                    paddingTop: "2rem",
                                    borderTop: "1px solid var(--border)"
                                }}>
                                    {caso.resultados.map((res, i) => (
                                        <div key={i}>
                                            <div style={{ fontSize: "2rem", fontWeight: 700, color: caso.color }}>{res.metric}</div>
                                            <div style={{ fontSize: "0.75rem", color: "var(--foreground-muted)" }}>{res.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Visual Column - Sticky Effect needs to be handled via CSS or just naturally by grid height */}
                            {/* To achieve real sticky effect inside the section, the container needs height, and this item needs sticky */}
                            <div style={{
                                order: index % 2 === 0 ? 2 : 1,
                                height: "80vh", // Fixed height for visual consistency
                                position: "sticky",
                                top: "10vh", // Center in viewport
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                            }} className="hidden-on-mobile">
                                <CaseVisual
                                    category={caso.categoria}
                                    color={caso.color}
                                    id={caso.id}
                                />
                            </div>

                            {/* Mobile Visual Fallback (Static) */}
                            <div className="show-on-mobile" style={{ order: 3, height: "300px", width: "100%", marginTop: "2rem" }}>
                                <CaseVisual
                                    category={caso.categoria}
                                    color={caso.color}
                                    id={caso.id}
                                />
                            </div>

                        </div>
                    </section>
                ))}
            </div>

            {/* Final Call to Action */}
            <section style={{ padding: "10rem 0", textAlign: "center", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "600px", height: "600px", background: "radial-gradient(circle, rgba(58, 98, 184, 0.15) 0%, transparent 70%)", borderRadius: "50%", filter: "blur(100px)", zIndex: -1 }} />

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

            {/* Inline CSS for Responsive Grid */}
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
