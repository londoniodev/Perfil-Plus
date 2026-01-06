import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Servicios | Empresas, Explora y Psicoterapia — Mauro Mera",
    description: "Tres rutas de acompañamiento: consultoría organizacional, orientación vocacional con IA (Explora) y psicoterapia/coaching. Procesos claros, humanos y medibles.",
};

// Icons
const IconBuilding = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
        <path d="M9 22v-4h6v4" />
        <path d="M8 6h.01" /><path d="M16 6h.01" /><path d="M12 6h.01" />
        <path d="M12 10h.01" /><path d="M12 14h.01" />
        <path d="M16 10h.01" /><path d="M16 14h.01" />
        <path d="M8 10h.01" /><path d="M8 14h.01" />
    </svg>
);

const IconCompass = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
);

const IconHeart = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
);

const IconCheck = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const IconArrowRight = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

const IconUsers = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

const IconGraduationCap = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
);

const IconShield = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);

export default function ServiciosPage() {
    return (
        <>
            {/* Hero */}
            <section
                className="section"
                style={{
                    paddingTop: "140px",
                    paddingBottom: "80px",
                    textAlign: "center",
                }}
            >
                <div className="container animate-reveal">
                    <h1 className="section-title">
                        Trabaja conmigo
                    </h1>
                    <p
                        className="section-subtitle"
                        style={{
                            margin: "0 auto 3rem",
                        }}
                    >
                        Elige la ruta que mejor encaje con tu momento: organización, vocación o mundo interno.
                    </p>

                    <div style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
                        <a href="#empresas" className="btn btn-ghost">
                            <IconBuilding />
                            Empresas
                        </a>
                        <a href="#explora" className="btn btn-accent">
                            <IconCompass />
                            Explora
                        </a>
                        <a href="#terapia" className="btn btn-ghost">
                            <IconHeart />
                            Psicoterapia
                        </a>
                    </div>
                </div>
            </section>

            {/* Sección 1 — Empresas */}
            <section id="empresas" className="section">
                <div className="container">
                    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                        <div className="icon-box">
                            <IconBuilding />
                        </div>
                        <h2 className="section-title" style={{ fontSize: "2.5rem" }}>Consultoría organizacional & desarrollo</h2>
                        <p className="section-subtitle" style={{ marginBottom: "3rem" }}>
                            Cultura clara. Liderazgo humano. Equipos que conversan mejor y sostienen resultados.
                        </p>

                        {/* Problemas típicos */}
                        <div className="card" style={{ marginBottom: "2rem" }}>
                            <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1.5rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--foreground-muted)" }}>
                                Problemas típicos que resolvemos
                            </h3>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" }}>
                                {[
                                    '"Tenemos estrategia, pero la cultura no acompaña."',
                                    '"El liderazgo está agotado y la conversación se volvió difícil."',
                                    '"Los equipos funcionan… pero no confían."',
                                    '"Queremos vender mejor sin romper el bienestar."',
                                ].map((problem, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            padding: "1rem",
                                            background: "rgba(255,255,255,0.03)",
                                            borderRadius: "0.75rem",
                                            border: "1px solid var(--border)",
                                            fontStyle: "italic",
                                            color: "var(--foreground-muted)",
                                            fontSize: "0.95rem",
                                        }}
                                    >
                                        {problem}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Qué incluye */}
                        <div className="card" style={{ marginBottom: "2rem" }}>
                            <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--foreground-muted)" }}>
                                Qué incluye
                            </h3>
                            <ul style={{ display: "grid", gap: "0.75rem" }}>
                                {[
                                    "Diagnóstico (cultura, liderazgo, clima, conversaciones)",
                                    "Diseño de programa a la medida",
                                    "Talleres experienciales",
                                    "Acompañamiento 1:1 a líderes clave",
                                    "Seguimiento, medición y entregables",
                                ].map((item, i) => (
                                    <li key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "var(--foreground-muted)" }}>
                                        <span style={{ color: "var(--primary)" }}><IconCheck /></span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Beneficios */}
                        <div className="card" style={{ marginBottom: "3rem" }}>
                            <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--foreground-muted)" }}>
                                Beneficios
                            </h3>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" }}>
                                {[
                                    "Cultura coherente con la estrategia",
                                    "Liderazgo preparado para conversaciones difíciles",
                                    "Equipos con compromiso y propósito",
                                    "Programas medibles con seguimiento real",
                                ].map((benefit, i) => (
                                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                        <span style={{ color: "var(--success)" }}><IconCheck /></span>
                                        <span style={{ color: "var(--foreground-muted)" }}>{benefit}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* CTA */}
                        <div
                            style={{
                                background: "linear-gradient(135deg, var(--card-bg) 0%, var(--background-secondary) 100%)",
                                padding: "3rem",
                                borderRadius: "1.5rem",
                                border: "1px solid var(--border)",
                                textAlign: "center",
                            }}
                        >
                            <h3 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.75rem", color: "var(--foreground)" }}>
                                ¿Cómo empezamos?
                            </h3>
                            <p style={{ opacity: 0.8, marginBottom: "2rem", color: "var(--foreground-muted)" }}>
                                Reunión de diagnóstico (sin costo) → Propuesta a la medida → Kick-off
                            </p>
                            <Link
                                href="https://wa.me/573183771838?text=Hola%20Mauro,%20me%20interesa%20consultoría%20para%20empresas."
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-primary"
                            >
                                <IconCalendar />
                                Agenda reunión de diagnóstico
                            </Link>
                            <p style={{ fontSize: "0.85rem", opacity: 0.6, marginTop: "1.5rem", color: "var(--foreground-muted)" }}>
                                En 30–45 min entendemos tu contexto y te digo la ruta más útil.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Sección 2 — Explora */}
            <section id="explora" className="section">
                <div className="container">
                    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                        <div className="badge" style={{ marginBottom: "1.5rem" }}>
                            Destacado
                        </div>
                        <div className="icon-box icon-box-accent">
                            <IconCompass />
                        </div>
                        <h2 className="section-title" style={{ fontSize: "2.5rem" }}>Explora: orientación vocacional</h2>
                        <p className="section-subtitle" style={{ marginBottom: "3rem" }}>
                            Menos ansiedad. Más claridad. Decisiones de estudio y carrera con información que se entiende y se usa.
                        </p>

                        {/* Para quién */}
                        <div className="card card-featured" style={{ marginBottom: "2rem" }}>
                            <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1.5rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--foreground-muted)" }}>
                                Para quién es
                            </h3>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1.5rem" }}>
                                {[
                                    { icon: <IconGraduationCap />, text: "Estudiantes de últimos grados" },
                                    { icon: <IconUsers />, text: "Universitarios en duda o cambio" },
                                    { icon: <IconHeart />, text: "Familias que quieren acompañar" },
                                    { icon: <IconBuilding />, text: "Colegios y universidades" },
                                ].map((item, i) => (
                                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                        <span style={{ color: "var(--accent)" }}>{item.icon}</span>
                                        <span style={{ color: "var(--foreground)", fontWeight: 500 }}>{item.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Qué incluye */}
                        <div className="card" style={{ marginBottom: "2rem" }}>
                            <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--foreground-muted)" }}>
                                Qué incluye Explora
                            </h3>
                            <ul style={{ display: "grid", gap: "0.75rem" }}>
                                {[
                                    "Evaluaciones vocacionales y perfil personal",
                                    "Sesiones 1:1 con el joven (y familia si se requiere)",
                                    "App con IA para organizar y explicar resultados",
                                    "Informe final con recomendaciones prácticas",
                                ].map((item, i) => (
                                    <li key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "var(--foreground-muted)" }}>
                                        <span style={{ color: "var(--accent)" }}><IconCheck /></span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Resultados */}
                        <div className="card" style={{ marginBottom: "3rem" }}>
                            <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--foreground-muted)" }}>
                                Resultados que buscamos
                            </h3>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" }}>
                                {[
                                    "Decisiones más conscientes",
                                    "Menos riesgo de deserción",
                                    "Lenguaje claro familia + estudiante",
                                    "Integración humano + tecnología",
                                ].map((result, i) => (
                                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                        <span style={{ color: "var(--success)" }}><IconCheck /></span>
                                        <span style={{ color: "var(--foreground-muted)" }}>{result}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* CTAs */}
                        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
                            <Link
                                href="https://wa.me/573183771838?text=Hola%20Mauro,%20me%20interesa%20el%20programa%20Explora."
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-accent"
                                style={{ minWidth: "240px" }}
                            >
                                <IconCalendar />
                                Agendar Explora (Familias)
                            </Link>
                            <Link
                                href="https://wa.me/573183771838?text=Hola%20Mauro,%20me%20interesa%20llevar%20Explora%20a%20mi%20institución."
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-secondary"
                                style={{ minWidth: "240px" }}
                            >
                                Programa institucional
                                <IconArrowRight />
                            </Link>
                        </div>

                        {/* FAQ */}
                        <div style={{ marginTop: "4rem" }}>
                            <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1.5rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--foreground-muted)" }}>
                                Preguntas frecuentes
                            </h3>
                            <div style={{ display: "grid", gap: "1rem" }}>
                                {[
                                    { q: "¿Cuánto dura el proceso?", a: "Depende del caso; usualmente 4-6 sesiones + informe." },
                                    { q: "¿La IA reemplaza al acompañamiento?", a: "No: traduce y organiza, el proceso es guiado y humano." },
                                    { q: "¿Es solo para elegir carrera?", a: "También sirve para reorientación y cambios." },
                                ].map((faq, i) => (
                                    <div
                                        key={i}
                                        className="card"
                                        style={{ padding: "1.5rem" }}
                                    >
                                        <p style={{ fontWeight: 600, marginBottom: "0.5rem", color: "var(--foreground)" }}>{faq.q}</p>
                                        <p style={{ color: "var(--foreground-muted)" }}>{faq.a}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Sección 3 — Psicoterapia */}
            <section id="terapia" className="section">
                <div className="container">
                    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                        <div className="icon-box icon-box-success">
                            <IconHeart />
                        </div>
                        <h2 className="section-title" style={{ fontSize: "2.5rem" }}>Psicoterapia y coaching</h2>
                        <p className="section-subtitle" style={{ marginBottom: "3rem" }}>
                            Un espacio seguro para entenderte, sanar, ordenar y decidir. Vida con más sentido.
                        </p>

                        {/* Lo que trabajamos */}
                        <div className="card" style={{ marginBottom: "2rem" }}>
                            <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--foreground-muted)" }}>
                                Lo que trabajamos
                            </h3>
                            <ul style={{ display: "grid", gap: "0.75rem" }}>
                                {[
                                    "Ansiedad, estrés, duelo, crisis",
                                    "Vínculos: pareja, familia, afectividad",
                                    "Patrones repetidos e historia personal",
                                    "Decisiones importantes y transiciones",
                                    "Éxito externo vs bienestar interno",
                                ].map((item, i) => (
                                    <li key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "var(--foreground-muted)" }}>
                                        <span style={{ color: "var(--success)" }}><IconCheck /></span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Formato */}
                        <div className="card" style={{ marginBottom: "2rem" }}>
                            <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--foreground-muted)" }}>
                                Formato
                            </h3>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
                                {[
                                    { icon: <IconUsers />, text: "Sesiones 1:1" },
                                    { icon: <IconShield />, text: "Presencial u online" },
                                    { icon: <IconHeart />, text: "Integración completa" },
                                ].map((item, i) => (
                                    <div key={i} style={{ textAlign: "center", padding: "1rem" }}>
                                        <div style={{ color: "var(--success)", display: "flex", justifyContent: "center", marginBottom: "0.5rem" }}>{item.icon}</div>
                                        <span style={{ color: "var(--foreground-muted)", fontSize: "0.9rem" }}>{item.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Beneficios */}
                        <div className="card" style={{ marginBottom: "3rem" }}>
                            <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--foreground-muted)" }}>
                                Beneficios
                            </h3>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" }}>
                                {[
                                    "Claridad emocional y mental",
                                    "Mejor gestión de conflictos",
                                    "Más serenidad para decidir",
                                    'Sentirte "más en casa" contigo',
                                ].map((benefit, i) => (
                                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                        <span style={{ color: "var(--success)" }}><IconCheck /></span>
                                        <span style={{ color: "var(--foreground-muted)" }}>{benefit}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* CTA */}
                        <div style={{ textAlign: "center" }}>
                            <Link
                                href="https://wa.me/573183771838?text=Hola%20Mauro,%20me%20interesa%20iniciar%20psicoterapia."
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-primary"
                            >
                                <IconCalendar />
                                Agendar primera sesión
                            </Link>
                            <p style={{ color: "var(--foreground-muted)", fontSize: "0.9rem", marginTop: "1rem" }}>
                                Si no sabes por dónde empezar, lo armamos juntos.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Final */}
            <section
                id="agendar"
                style={{
                    padding: "8rem 0",
                    position: "relative",
                    overflow: "hidden",
                    textAlign: "center",
                }}
            >
                <div style={{
                    position: "absolute",
                    inset: 0,
                    background: "radial-gradient(circle at center, rgba(91,141,239,0.15), transparent 70%)",
                    zIndex: -1
                }} />

                <div className="container" style={{ position: "relative", zIndex: 1 }}>
                    <h2 className="section-title">
                        ¿No estás seguro cuál ruta necesitas?
                    </h2>
                    <p className="section-subtitle" style={{ margin: "0 auto 2rem" }}>
                        Agenda y te recomiendo la mejor opción según tu momento.
                    </p>
                    <Link
                        href="https://wa.me/573183771838?text=Hola%20Mauro,%20no%20sé%20por%20dónde%20empezar,%20hablemos."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary"
                        style={{ padding: "1.25rem 2.5rem" }}
                    >
                        <IconCalendar />
                        Agendar Diagnóstico
                    </Link>
                </div>
            </section>
        </>
    );
}
