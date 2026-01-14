"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "@/app/styles/services.module.css";
import {
    IconBuilding,
    IconCompass,
    IconHeart,
    IconCheck,
    IconCalendar,
    IconAward as IconGraduationCap, // Replace with Award
    IconUsers,
    IconArrowRight, // Not used but available
    IconExternalLink
} from "@/app/components/ui/Icons";

// --- Components Helpers ---

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <div className={`${styles.serviceCard} ${className}`}>
        {children}
    </div>
);

const SectionHeading = ({ title, subtitle }: { title: string; subtitle: string }) => (
    <div className={styles.sectionHeading}>
        <h2 className="section-title mb-md">{title}</h2>
        <p className={`section-subtitle ${styles.sectionSubtitle}`}>
            {subtitle}
        </p>
    </div>
);

const FeatureList = ({ items, iconColor = "var(--primary)" }: { items: string[], iconColor?: string }) => (
    <ul className={styles.featureList}>
        {items.map((item, i) => (
            <li key={i} className={styles.featureItem}>
                <span className={styles.featureIcon} style={{ color: iconColor }}><IconCheck /></span>
                <span>{item}</span>
            </li>
        ))}
    </ul>
);

// --- Content Components ---

const ContentEmpresas = ({ color = "var(--primary)" }: { color?: string }) => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <SectionHeading
            title="Consultoría organizacional & desarrollo"
            subtitle="Cultura clara. Liderazgo humano. Equipos que conversan mejor y sostienen resultados. Transformamos la dinámica interna para potenciar el negocio."
        />

        <div className={`${styles.gridAuto} ${styles.mb3}`}>
            {/* Row 1: Pain Points & Solution */}
            <div className={styles.gridCards}>
                <Card>
                    <h3 className="card-title">
                        ¿Te suena familiar?
                    </h3>
                    <div className={styles.gridGap}>
                        {[
                            { text: "Estrategia clara, pero cultura desconectada.", author: "CEO frustrado" },
                            { text: "Líderes operativos, pero sin herramientas humanas.", author: "RRHH" },
                            { text: "Silos entre áreas que frenan la agilidad.", author: "Gerencia" },
                            { text: "Alta rotación de talento clave.", author: "Equipo" }
                        ].map((item, i) => (
                            <div key={i} className={styles.quoteBox} style={{ '--quote-color': color } as React.CSSProperties}>
                                "{item.text}"
                            </div>
                        ))}
                    </div>
                </Card>

                <Card>
                    <h3 className="card-title">
                        Nuestra Intervención
                    </h3>
                    <p className={`text-muted ${styles.mb15}`} style={{ textAlign: "left" }}>
                        No entregamos PDFs que nadie lee. Diseñamos experiencias y acompañamientos que cambian comportamientos.
                    </p>
                    <FeatureList iconColor={color} items={[
                        "Diagnóstico de cultura y clima (más allá de la encuesta).",
                        "Desarrollo de habilidades conversacionales para líderes.",
                        "Alineación de equipos directivos (Team Coaching).",
                        "Diseño de rituales y artefactos culturales.",
                        "Gestión del cambio para nuevas implementaciones."
                    ]} />
                </Card>
            </div>

            {/* Row 2: The Process (Steps) */}
            <div className={styles.processBox}>
                <h3 className={`card-title ${styles.sectionHeading}`}>
                    Cómo trabajamos
                </h3>
                <div className={styles.gridSteps}>
                    {[
                        { step: "01", title: "Entender", desc: "Diagnóstico profundo y entrevistas." },
                        { step: "02", title: "Diseñar", desc: "Co-creación de la ruta de solución." },
                        { step: "03", title: "Activar", desc: "Talleres, coaching y mentoría." },
                        { step: "04", title: "Medir", desc: "Seguimiento a indicadores de impacto." }
                    ].map((s, i) => (
                        <div key={i} className={styles.stepContainer}>
                            <div className={styles.stepNumber}>{s.step}</div>
                            <h4 className={styles.stepTitle} style={{ color }}>{s.title}</h4>
                            <p className={styles.stepDesc}>{s.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* CTA */}
        <div className="text-center">
            <Link
                href="https://wa.me/573183771838?text=Hola%20Mauro,%20me%20interesa%20consultoría%20para%20empresas."
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-lg"
                style={{ background: color, borderColor: color }}
            >
                <IconCalendar style={{ marginRight: "0.5rem" }} />
                Agenda reunión de diagnóstico
            </Link>
            <p className="cta-helper">
                30 min para evaluar si somos el fit correcto.
            </p>
        </div>
    </div>
);

const ContentExplora = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <SectionHeading
            title="Explora: Orientación Vocacional y Profesional"
            subtitle="Menos ansiedad. Más claridad. Decisiones de estudio y carrera con información que se entiende y se usa. Tecnología + Humanidad."
        />

        <div className={`${styles.gridAuto} ${styles.mb3}`}>
            {/* Main Value Prop */}
            <div className={styles.gridCardsWide}>
                <Card>
                    <h3 className="card-title" style={{ color: "var(--accent)" }}>
                        Para jóvenes y familias
                    </h3>
                    <p className={`text-muted ${styles.mb15}`} style={{ textAlign: "left" }}>
                        La pregunta "¿Qué vas a estudiar?" no tiene que ser una tortura. Transformamos la incertidumbre en un plan de acción concreto.
                    </p>
                    <div className={styles.gridTags}>
                        {[
                            { icon: <IconGraduationCap />, label: "Estudiantes 10° y 11°" },
                            { icon: <IconUsers />, label: "Universitarios en duda" },
                            { icon: <IconHeart />, label: "Padres que acompañan" },
                            { icon: <IconCompass />, label: "Proyectos de vida" },
                        ].map((tag, i) => (
                            <div key={i} className={styles.tagItem}>
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
            <div className={styles.highlightBox}>
                <div className={styles.gridGap}>
                    <h3 className={`card-title ${styles.sectionHeading}`} style={{ color: "var(--accent)" }}>
                        ¿Por qué es diferente?
                    </h3>
                    <p className={`text-muted ${styles.mb15}`} style={{ lineHeight: 1.6 }}>
                        La mayoría de tests te dan una lista fría de carreras. <strong>Explora</strong> combina data precisa con acompañamiento humano. Usamos IA para procesar miles de opciones, pero la decisión la tomas tú con criterio y acompañamiento experto.
                    </p>
                    <div className="flex-center">
                        <span className={`${styles.tagPill} ${styles.tagPillAccent}`}>Data-driven</span>
                        <span className={`${styles.tagPill} ${styles.tagPillDefault}`}>100% Personalizado</span>
                        <span className={`${styles.tagPill} ${styles.tagPillDefault}`}>Moderno</span>
                    </div>
                </div>
            </div>
        </div>

        <div className="text-center">
            <Link
                href="https://app.universoexplora.tech"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-accent btn-lg"
            >
                Iniciar Explora
                <IconExternalLink style={{ marginLeft: "0.5rem" }} />
            </Link>
            <p className="cta-helper">
                Empieza hoy mismo tu proceso de descubrimiento.
            </p>
        </div>
    </div>
);

const ContentTerapia = ({ color = "var(--success)" }: { color?: string }) => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <SectionHeading
            title="Psicoterapia y coaching"
            subtitle="Un espacio seguro para entenderte, sanar, ordenar y decidir. Más allá del alivio sintomático, buscamos una vida con mayor sentido y agencia."
        />

        <div className={`${styles.gridAuto} ${styles.mb3}`}>
            {/* Grid 3 cols for types of work */}
            <div className={styles.gridCardsNarrow}>
                <Card>
                    <div className={styles.iconCenter} style={{ color }}>
                        <IconHeart />
                    </div>
                    <h3 className="card-title text-center">
                        Clínica & Salud Mental
                    </h3>
                    <p className="text-muted text-sm text-center" style={{ lineHeight: 1.5 }}>
                        Ansiedad, depresión leve, duelos, estrés crónico. Un enfoque compasivo para recuperar tu equilibrio.
                    </p>
                </Card>
                <Card>
                    <div className={styles.iconCenter} style={{ color }}>
                        <IconUsers />
                    </div>
                    <h3 className="card-title text-center">
                        Vínculos y Relaciones
                    </h3>
                    <p className="text-muted text-sm text-center" style={{ lineHeight: 1.5 }}>
                        Dificultades de pareja, familia, o patrones repetitivos en cómo te relacionas con los demás.
                    </p>
                </Card>
                <Card>
                    <div className={styles.iconCenter} style={{ color }}>
                        <IconCompass />
                    </div>
                    <h3 className="card-title text-center">
                        Coaching & Propósito
                    </h3>
                    <p className="text-muted text-sm text-center" style={{ lineHeight: 1.5 }}>
                        Bloqueos creativos, decisiones de carrera, síndrome del impostor y búsqueda de sentido vital.
                    </p>
                </Card>
            </div>

            {/* Approach */}
            <div className={styles.gridCardsWide}>
                <div className={styles.textLeft}>
                    <h3 className={`card-title ${styles.mb1}`} style={{ fontSize: "1.5rem", color: "white" }}>
                        Mi enfoque
                    </h3>
                    <p className={`text-muted ${styles.mb15}`} style={{ lineHeight: 1.6 }}>
                        Integro herramientas de la <strong>Psicología Profunda</strong>, <strong>Terapia Cognitiva</strong> y <strong>Filosofía Práctica</strong>. No creo en las "curas mágicas", pero sí en el poder de la conversación honesta para transformar la propia narrativa.
                    </p>
                    <p className="text-muted" style={{ lineHeight: 1.6 }}>
                        Las sesiones son espacios de confidencialidad absoluta, escucha activa y preguntas que abren nuevas perspectivas.
                    </p>
                </div>
                <div className={styles.infoBox}>
                    <h4 className={`mb-md ${styles.stepTitle}`} style={{ fontWeight: 700, color }}>Modalidades</h4>
                    <ul className={styles.modalList}>
                        <li className={styles.modalItem}>
                            <span>Online (Google Meet)</span>
                            <span className="text-muted">Global</span>
                        </li>
                        <li className={styles.modalItem}>
                            <span>Presencial</span>
                            <span className="text-muted">Cali, Colombia</span>
                        </li>
                        <li className={styles.modalItemLast}>
                            <span>Duración</span>
                            <span className="text-muted">50 minutos</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>

        <div className="text-center">
            <Link
                href="https://wa.me/573183771838?text=Hola%20Mauro,%20me%20interesa%20iniciar%20psicoterapia."
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-lg"
                style={{ background: color, borderColor: color }}
            >
                <IconCalendar style={{ marginRight: "0.5rem" }} />
                Agendar primera sesión
            </Link>
            <p className="cta-helper">
                Si tienes dudas sobre qué modalidad es para ti, escríbeme.
            </p>
        </div>
    </div >
);

export function ServicesSelector() {
    const [activeTab, setActiveTab] = useState<"empresas" | "explora" | "psicoterapia">("empresas");

    // Reading hash for deep linking
    useEffect(() => {
        const hash = window.location.hash.replace("#", "");
        if (hash === "empresas") setActiveTab("empresas");
        else if (hash === "explora") setActiveTab("explora");
        else if (hash === "bienestar" || hash === "psicoterapia") setActiveTab("psicoterapia");
    }, []);

    const tabs = [
        { id: "empresas", label: "Empresas", icon: <IconBuilding />, color: "var(--primary)" }, // Azul
        { id: "explora", label: "Explora", icon: <IconCompass />, color: "var(--accent)" }, // Amarillo
        { id: "psicoterapia", label: "Psicoterapia", icon: <IconHeart />, color: "var(--success)" }, // Verde
    ];

    const currentTabColor = tabs.find(t => t.id === activeTab)?.color || "var(--primary)";

    return (
        <section className={styles.mainSection}>
            {/* Background Glows */}
            <div className={styles.bgGlow} style={{ background: currentTabColor }} />

            <div className={styles.selectorContainer}>

                {/* Selector Tabs */}
                <div className={styles.tabsWrapper}>
                    <div className={styles.tabsContainer}>
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={styles.tabButton}
                                    style={{
                                        gap: isActive ? "0.6rem" : "0",
                                        padding: isActive ? "0.7rem 1.5rem" : "0.7rem",
                                        background: isActive ? tab.color : "transparent",
                                        color: isActive ? (tab.id === "explora" ? "black" : "white") : tab.color,
                                        minWidth: isActive ? "auto" : "3.2rem",
                                    }}
                                >
                                    <span className={styles.tabIcon}>{tab.icon}</span>

                                    {/* Text Label - Only visible when active */}
                                    <span className={styles.tabLabel} style={{
                                        maxWidth: isActive ? "200px" : "0",
                                        opacity: isActive ? 1 : 0,
                                    }}>
                                        {tab.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content Area */}
                <div className={styles.contentArea}>
                    {activeTab === "empresas" && <ContentEmpresas color="var(--primary)" />}
                    {activeTab === "explora" && <ContentExplora />}
                    {activeTab === "psicoterapia" && <ContentTerapia color="var(--success)" />}
                </div>

            </div>
        </section>
    );
}
