"use client";

import { useState } from "react";
import Link from "next/link";
import {
    IconBuilding,
    IconCompass,
    IconHeart,
    IconCheck,
    IconCalendar,
    IconGraduationCap,
    IconUsers,
    IconShield,
    IconArrowRight,
    IconExternalLink
} from "../icons";

// --- Components Helpers ---

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <div className={`card ${className}`} style={{
        background: "rgba(255, 255, 255, 0.03)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "1rem",
        padding: "2rem",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "border-color 0.3s ease, transform 0.3s ease",
    }}>
        {children}
    </div>
);

const SectionHeading = ({ title, subtitle }: { title: string; subtitle: string }) => (
    <div style={{ marginBottom: "4rem", textAlign: "center" }}>
        <h2 className="section-title" style={{ marginBottom: "1rem" }}>{title}</h2>
        <p className="section-subtitle" style={{
            maxWidth: "700px",
            margin: "0 auto",
        }}>
            {subtitle}
        </p>
    </div>
);

const FeatureList = ({ items, iconColor = "var(--primary)" }: { items: string[], iconColor?: string }) => (
    <ul style={{ display: "grid", gap: "1rem" }}>
        {items.map((item, i) => (
            <li key={i} style={{ display: "flex", alignItems: "start", gap: "0.75rem", color: "var(--foreground-muted)", fontSize: "0.95rem", lineHeight: 1.5, textAlign: "left" }}>
                <span style={{ color: iconColor, marginTop: "0.2rem", flexShrink: 0 }}><IconCheck /></span>
                <span>{item}</span>
            </li>
        ))}
    </ul>
);

// --- Content Components ---

const ContentEmpresas = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <SectionHeading
            title="Consultoría organizacional & desarrollo"
            subtitle="Cultura clara. Liderazgo humano. Equipos que conversan mejor y sostienen resultados. Transformamos la dinámica interna para potenciar el negocio."
        />

        <div style={{ display: "grid", gap: "2rem", marginBottom: "3rem" }}>
            {/* Row 1: Pain Points & Solution */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "2rem" }}>
                <Card>
                    <h3 className="card-title">
                        ¿Te suena familiar?
                    </h3>
                    <div style={{ display: "grid", gap: "1rem" }}>
                        {[
                            { text: "Estrategia clara, pero cultura desconectada.", author: "CEO frustrado" },
                            { text: "Líderes operativos, pero sin herramientas humanas.", author: "RRHH" },
                            { text: "Silos entre áreas que frenan la agilidad.", author: "Gerencia" },
                            { text: "Alta rotación de talento clave.", author: "Equipo" }
                        ].map((item, i) => (
                            <div key={i} style={{
                                padding: "1rem",
                                background: "rgba(0,0,0,0.2)",
                                borderRadius: "0.75rem",
                                borderLeft: "3px solid var(--border)",
                                fontSize: "0.9rem",
                                fontStyle: "italic",
                                color: "var(--foreground-muted)"
                            }}>
                                "{item.text}"
                            </div>
                        ))}
                    </div>
                </Card>

                <Card>
                    <h3 className="card-title">
                        Nuestra Intervención
                    </h3>
                    <p style={{ marginBottom: "1.5rem", color: "var(--foreground-muted)", lineHeight: 1.6, textAlign: "left" }}>
                        No entregamos PDFs que nadie lee. Diseñamos experiencias y acompañamientos que cambian comportamientos.
                    </p>
                    <FeatureList items={[
                        "Diagnóstico de cultura y clima (más allá de la encuesta).",
                        "Desarrollo de habilidades conversacionales para líderes.",
                        "Alineación de equipos directivos (Team Coaching).",
                        "Diseño de rituales y artefactos culturales.",
                        "Gestión del cambio para nuevas implementaciones."
                    ]} />
                </Card>
            </div>

            {/* Row 2: The Process (Steps) */}
            <div style={{
                background: "rgba(255,255,255,0.02)",
                borderRadius: "1.5rem",
                padding: "3rem 2rem",
                border: "1px solid var(--border)"
            }}>
                <h3 className="card-title" style={{ textAlign: "center", marginBottom: "2rem" }}>
                    Cómo trabajamos
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "2rem", textAlign: "center" }}>
                    {[
                        { step: "01", title: "Entender", desc: "Diagnóstico profundo y entrevistas." },
                        { step: "02", title: "Diseñar", desc: "Co-creación de la ruta de solución." },
                        { step: "03", title: "Activar", desc: "Talleres, coaching y mentoría." },
                        { step: "04", title: "Medir", desc: "Seguimiento a indicadores de impacto." }
                    ].map((s, i) => (
                        <div key={i} style={{ position: "relative" }}>
                            <div style={{ fontSize: "3rem", fontWeight: 900, opacity: 0.1, lineHeight: 1, marginBottom: "0.5rem" }}>{s.step}</div>
                            <h4 style={{ fontWeight: 600, marginBottom: "0.5rem", color: "var(--primary)" }}>{s.title}</h4>
                            <p style={{ fontSize: "0.85rem", color: "var(--foreground-muted)" }}>{s.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center" }}>
            <Link
                href="https://wa.me/573183771838?text=Hola%20Mauro,%20me%20interesa%20consultoría%20para%20empresas."
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ padding: "1rem 2rem", fontSize: "1rem" }}
            >
                <IconCalendar />
                Agenda reunión de diagnóstico
            </Link>
            <p style={{ fontSize: "0.85rem", opacity: 0.6, marginTop: "1rem", color: "var(--foreground-muted)" }}>
                30 min para evaluar si somos el fit correcto.
            </p>
        </div>
    </div>
);

const ContentExplora = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <SectionHeading
            title="Explora: orientación vocacional"
            subtitle="Menos ansiedad. Más claridad. Decisiones de estudio y carrera con información que se entiende y se usa. Tecnología + Humanidad."
        />

        <div style={{ display: "grid", gap: "2rem", marginBottom: "3rem" }}>
            {/* Main Value Prop */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "2rem",
                alignItems: "center"
            }}>
                <Card>
                    <h3 className="card-title" style={{ color: "var(--accent)" }}>
                        Para jóvenes y familias
                    </h3>
                    <p style={{ marginBottom: "1.5rem", color: "var(--foreground-muted)", textAlign: "left" }}>
                        La pregunta "¿Qué vas a estudiar?" no tiene que ser una tortura. Transformamos la incertidumbre en un plan de acción concreto.
                    </p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        {[
                            { icon: <IconGraduationCap />, label: "Estudiantes 10° y 11°" },
                            { icon: <IconUsers />, label: "Universitarios en duda" },
                            { icon: <IconHeart />, label: "Padres que acompañan" },
                            { icon: <IconCompass />, label: "Proyectos de vida" },
                        ].map((tag, i) => (
                            <div key={i} style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                fontSize: "0.85rem",
                                color: "var(--foreground)",
                                background: "rgba(255,255,255,0.05)",
                                padding: "0.5rem",
                                borderRadius: "0.5rem"
                            }}>
                                <span style={{ color: "var(--accent)" }}>{tag.icon}</span>
                                {tag.label}
                            </div>
                        ))}
                    </div>
                </Card>

                <Card>
                    <h3 className="card-title" style={{ color: "var(--accent)" }}>
                        Lo que incluye el programa
                    </h3>
                    <FeatureList iconColor="var(--accent)" items={[
                        "Test de perfil vocacional profundo (Intereses + Aptitudes).",
                        "Sesión de análisis y entrega de resultados (Online).",
                        "Acceso a la plataforma Explora con Asistente IA.",
                        "Roadmap de carreras sugeridas y universidades.",
                        "Plan de acción para la toma de decisión final."
                    ]} />
                </Card>
            </div>

            {/* The Tech/Human Mix */}
            <div style={{
                background: "linear-gradient(135deg, rgba(232, 168, 56, 0.1) 0%, rgba(0,0,0,0) 100%)",
                borderRadius: "1.5rem",
                padding: "2rem",
                border: "1px solid rgba(232, 168, 56, 0.2)",
                textAlign: "left"
            }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <h3 className="card-title" style={{ color: "var(--accent)" }}>
                        ¿Por qué es diferente?
                    </h3>
                    <p style={{ color: "var(--foreground-muted)", lineHeight: 1.6 }}>
                        La mayoría de tests te dan una lista fría de carreras. <strong>Explora</strong> combina data precisa con acompañamiento humano. Usamos IA para procesar miles de opciones, pero la decisión la tomas tú con criterio y acompañamiento experto.
                    </p>
                    <div style={{ display: "flex", gap: "1rem", marginTop: "1rem", flexWrap: "wrap" }}>
                        <span style={{ padding: "0.25rem 0.75rem", borderRadius: "1rem", background: "var(--accent)", color: "black", fontWeight: 600, fontSize: "0.85rem" }}>Data-driven</span>
                        <span style={{ padding: "0.25rem 0.75rem", borderRadius: "1rem", background: "rgba(255,255,255,0.1)", color: "white", fontSize: "0.85rem" }}>100% Personalizado</span>
                        <span style={{ padding: "0.25rem 0.75rem", borderRadius: "1rem", background: "rgba(255,255,255,0.1)", color: "white", fontSize: "0.85rem" }}>Moderno</span>
                    </div>
                </div>
            </div>
        </div>

        <div style={{ textAlign: "center" }}>
            <Link
                href="https://app.universoexplora.tech"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-accent"
                style={{ padding: "1rem 2rem", fontSize: "1rem" }}
            >
                Iniciar Explora
                <IconExternalLink />
            </Link>
            <p style={{ fontSize: "0.85rem", opacity: 0.6, marginTop: "1rem", color: "var(--foreground-muted)" }}>
                Empieza hoy mismo tu proceso de descubrimiento.
            </p>
        </div>
    </div>
);

const ContentTerapia = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <SectionHeading
            title="Psicoterapia y coaching"
            subtitle="Un espacio seguro para entenderte, sanar, ordenar y decidir. Más allá del alivio sintomático, buscamos una vida con mayor sentido y agencia."
        />

        <div style={{ display: "grid", gap: "2rem", marginBottom: "3rem" }}>
            {/* Grid 3 cols for types of work */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
                <Card>
                    <div style={{ color: "var(--success)", marginBottom: "1rem" }}><IconHeart /></div>
                    <h3 className="card-title">
                        Clínica & Salud Mental
                    </h3>
                    <p style={{ fontSize: "0.9rem", color: "var(--foreground-muted)", lineHeight: 1.5, textAlign: "left" }}>
                        Ansiedad, depresión leve, duelos, estrés crónico. Un enfoque compasivo para recuperar tu equilibrio.
                    </p>
                </Card>
                <Card>
                    <div style={{ color: "var(--success)", marginBottom: "1rem" }}><IconUsers /></div>
                    <h3 className="card-title">
                        Vínculos y Relaciones
                    </h3>
                    <p style={{ fontSize: "0.9rem", color: "var(--foreground-muted)", lineHeight: 1.5, textAlign: "left" }}>
                        Dificultades de pareja, familia, o patrones repetitivos en cómo te relacionas con los demás.
                    </p>
                </Card>
                <Card>
                    <div style={{ color: "var(--success)", marginBottom: "1rem" }}><IconCompass /></div>
                    <h3 className="card-title">
                        Coaching & Propósito
                    </h3>
                    <p style={{ fontSize: "0.9rem", color: "var(--foreground-muted)", lineHeight: 1.5, textAlign: "left" }}>
                        Bloqueos creativos, decisiones de carrera, síndrome del impostor y búsqueda de sentido vital.
                    </p>
                </Card>
            </div>

            {/* Approach */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "2rem",
                alignItems: "center"
            }}>
                <div style={{ textAlign: "left" }}>
                    <h3 className="card-title" style={{ fontSize: "1.5rem", marginBottom: "1rem", color: "white" }}>
                        Mi enfoque
                    </h3>
                    <p style={{ color: "var(--foreground-muted)", marginBottom: "1.5rem", lineHeight: 1.6 }}>
                        Integro herramientas de la <strong>Psicología Profunda</strong>, <strong>Terapia Cognitiva</strong> y <strong>Filosofía Práctica</strong>. No creo en las "curas mágicas", pero sí en el poder de la conversación honesta para transformar la propia narrativa.
                    </p>
                    <p style={{ color: "var(--foreground-muted)", lineHeight: 1.6 }}>
                        Las sesiones son espacios de confidencialidad absoluta, escucha activa y preguntas que abren nuevas perspectivas.
                    </p>
                </div>
                <div style={{
                    background: "rgba(255,255,255,0.03)",
                    padding: "1.5rem",
                    borderRadius: "1rem",
                    border: "1px solid var(--border)"
                }}>
                    <h4 style={{ fontWeight: 700, marginBottom: "1rem", color: "var(--success)" }}>Modalidades</h4>
                    <ul style={{ display: "grid", gap: "0.75rem" }}>
                        <li style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "0.5rem" }}>
                            <span style={{ color: "var(--foreground)" }}>Online (Google Meet)</span>
                            <span style={{ color: "var(--foreground-muted)" }}>Global</span>
                        </li>
                        <li style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "0.5rem" }}>
                            <span style={{ color: "var(--foreground)" }}>Presencial</span>
                            <span style={{ color: "var(--foreground-muted)" }}>Cali, Colombia</span>
                        </li>
                        <li style={{ display: "flex", justifyContent: "space-between", paddingTop: "0.5rem" }}>
                            <span style={{ color: "var(--foreground)" }}>Duración</span>
                            <span style={{ color: "var(--foreground-muted)" }}>50 minutos</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>

        <div style={{ textAlign: "center" }}>
            <Link
                href="https://wa.me/573183771838?text=Hola%20Mauro,%20me%20interesa%20iniciar%20psicoterapia."
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ padding: "1rem 2rem", fontSize: "1rem" }}
            >
                <IconCalendar />
                Agendar primera sesión
            </Link>
            <p style={{ fontSize: "0.85rem", opacity: 0.6, marginTop: "1rem", color: "var(--foreground-muted)" }}>
                Si tienes dudas sobre qué modalidad es para ti, escríbeme.
            </p>
        </div>
    </div>
);

export function ServicesSelector() {
    const [activeTab, setActiveTab] = useState<"empresas" | "explora" | "terapia">("explora");

    return (
        <section style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "6rem 0 5vh", // Adjusted padding
            position: "relative"
        }}>
            {/* Background Glows */}
            <div style={{
                position: "absolute",
                top: "20%",
                left: "10%",
                width: "300px",
                height: "300px",
                background: activeTab === "empresas" ? "var(--primary)" : activeTab === "explora" ? "var(--accent)" : "var(--success)",
                opacity: 0.05,
                filter: "blur(100px)",
                borderRadius: "50%",
                transition: "background 0.5s ease",
                zIndex: -1
            }} />
            <div style={{
                position: "absolute",
                bottom: "10%",
                right: "10%",
                width: "400px",
                height: "400px",
                background: activeTab === "empresas" ? "var(--primary)" : activeTab === "explora" ? "var(--accent)" : "var(--success)",
                opacity: 0.03,
                filter: "blur(120px)",
                borderRadius: "50%",
                transition: "background 0.5s ease",
                zIndex: -1
            }} />

            <div className="container" style={{ maxWidth: "1000px" }}>

                {/* Selector Tabs */}
                <div style={{
                    display: "flex",
                    justifyContent: "center",
                    marginBottom: "3rem"
                }}>
                    <div style={{
                        display: "flex",
                        background: "rgba(0,0,0,0.3)", // Darker contrasting bg for tabs
                        border: "1px solid var(--border)",
                        borderRadius: "100px",
                        padding: "0.4rem",
                        gap: "0.25rem",
                        backdropFilter: "blur(10px)",
                        boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5)"
                    }}>
                        {[
                            { id: "empresas", label: "Empresas", icon: <IconBuilding />, color: "var(--primary)" },
                            { id: "explora", label: "Explora", icon: <IconCompass />, color: "var(--accent)" },
                            { id: "terapia", label: "Psicoterapia", icon: <IconHeart />, color: "var(--success)" },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`btn-selector ${activeTab === tab.id ? "active" : ""}`}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                    padding: "0.6rem 1.5rem",
                                    borderRadius: "100px",
                                    border: "none",
                                    background: activeTab === tab.id ? tab.color : "transparent",
                                    color: activeTab === tab.id ? (tab.id === "explora" ? "black" : "white") : "var(--foreground-muted)",
                                    cursor: "pointer",
                                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                    fontSize: "0.95rem",
                                    fontWeight: activeTab === tab.id ? 600 : 500
                                }}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div style={{ textAlign: "center", minHeight: "600px" }}>
                    {activeTab === "empresas" && <ContentEmpresas />}
                    {activeTab === "explora" && <ContentExplora />}
                    {activeTab === "terapia" && <ContentTerapia />}
                </div>

            </div>
        </section>
    );
}
