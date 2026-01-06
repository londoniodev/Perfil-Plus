import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Portafolio | Casos y experiencias — Mauro Mera",
    description: "Casos de consultoría, talleres experienciales, programas de desarrollo, Explora y procesos de acompañamiento. Resultados, aprendizajes y metodología.",
};

// Icons
const IconCalendar = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);

const IconTrendingUp = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
    </svg>
);

const IconExternalLink = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
    </svg>
);

const casos = [
    {
        id: 1,
        titulo: "Programa de cultura y liderazgo",
        cliente: "Empresa del sector financiero",
        categoria: "Empresas",
        color: "var(--primary)",
        contexto: "Una empresa de 500+ empleados enfrentaba desalineación entre la estrategia de crecimiento y la cultura interna.",
        reto: "Alinear la cultura organizacional con los objetivos estratégicos y desarrollar habilidades de liderazgo.",
        intervencion: "Diagnóstico de cultura de 4 semanas, programa de desarrollo de 6 meses con talleres mensuales.",
        resultados: [
            "85% mejora en indicadores de clima",
            "30% reducción en rotación",
            "Nuevos rituales implementados",
        ],
    },
    {
        id: 2,
        titulo: "Escuela de ventas y servicio",
        cliente: "Empresa de retail",
        categoria: "Empresas",
        color: "var(--primary)",
        contexto: "Cadena de tiendas buscaba mejorar la experiencia del cliente sin sacrificar el bienestar del equipo.",
        reto: "Aumentar conversión y satisfacción del cliente cuidando el bienestar.",
        intervencion: "Diseño e implementación de escuela de ventas. 12 talleres regionales + acompañamiento.",
        resultados: [
            "15% aumento en ticket promedio",
            "NPS subió 22 puntos",
            "Programa replicado en otras regiones",
        ],
    },
    {
        id: 3,
        titulo: "Proceso Explora institucional",
        cliente: "Institución educativa",
        categoria: "Explora",
        color: "var(--accent)",
        contexto: "Colegio con alta ansiedad vocacional en estudiantes de último año.",
        reto: "Implementar un proceso de orientación vocacional escalable con tecnología.",
        intervencion: "Piloto con 60 estudiantes: evaluaciones, sesiones 1:1, app con IA, talleres con padres.",
        resultados: [
            "92% satisfacción de familias",
            "80% decisiones con más seguridad",
            "Programa adoptado como permanente",
        ],
    },
    {
        id: 4,
        titulo: "Transformación de mandos medios",
        cliente: "Empresa de manufactura",
        categoria: "Liderazgo",
        color: "var(--primary-light)",
        contexto: "Supervisores promovidos sin formación en liderazgo, generando conflictos.",
        reto: "Desarrollar competencias de liderazgo y comunicación en 25 supervisores.",
        intervencion: "Programa de 8 meses: taller mensual + coaching grupal + herramientas prácticas.",
        resultados: [
            "40% reducción en conflictos",
            "Mejora en evaluaciones de desempeño",
            "Supervisores como multiplicadores",
        ],
    },
    {
        id: 5,
        titulo: "Proceso Explora familiar",
        cliente: "Familia (caso anónimo)",
        categoria: "Explora",
        color: "var(--accent)",
        contexto: "Joven de 17 años con alta ansiedad por la decisión de carrera.",
        reto: "Clarificar perfil vocacional separando intereses genuinos de expectativas externas.",
        intervencion: "5 sesiones individuales + 2 familiares + app IA + informe final.",
        resultados: [
            "Claridad sobre 3 opciones viables",
            "Reducción significativa de ansiedad",
            "Familia alineada en acompañamiento",
        ],
    },
    {
        id: 6,
        titulo: "Taller de bienestar y propósito",
        cliente: "Equipo directivo de ONG",
        categoria: "Bienestar",
        color: "var(--success)",
        contexto: "Equipo de 12 personas con alto compromiso pero síntomas de agotamiento.",
        reto: "Reconectar al equipo con el propósito y establecer límites saludables.",
        intervencion: "Retiro de 2 días con metodología experiencial + seguimiento de 3 meses.",
        resultados: [
            "Nuevo acuerdo de equipo sobre límites",
            "Renovación del compromiso",
            "Herramientas de autocuidado",
        ],
    },
];

const categorias = ["Todos", "Empresas", "Liderazgo", "Explora", "Bienestar"];

export default function PortafolioPage() {
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
                        Portafolio: casos, experiencias & aprendizajes
                    </h1>
                    <p
                        className="section-subtitle"
                        style={{
                            margin: "0 auto 3rem",
                        }}
                    >
                        Trabajo con foco en transformación aplicable: claridad, conversación y acción sostenida.
                    </p>
                    <Link
                        href="https://wa.me/573183771838?text=Hola%20Mauro,%20quiero%20un%20diagnóstico%20basado%20en%20tu%20portafolio."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary"
                    >
                        <IconCalendar />
                        Quiero un diagnóstico
                    </Link>
                </div>
            </section>

            {/* Filtros */}
            <section style={{ padding: "2rem 0", borderBottom: "1px solid var(--border)", background: "rgba(22, 27, 34, 0.5)", backdropFilter: "blur(10px)" }}>
                <div className="container">
                    <div
                        className="filter-container"
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            gap: "0.75rem",
                            flexWrap: "wrap"
                        }}
                    >
                        {categorias.map((cat, i) => (
                            <button
                                key={i}
                                className={`btn ${i === 0 ? "btn-primary" : "btn-secondary"} btn-filter`}
                                style={{ padding: "0.5rem 1.25rem", fontSize: "0.875rem", minWidth: "auto" }}
                            >
                                {/* Add simple icons based on category name for better visual appeal */}
                                {cat === "Todos" && (
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
                                )}
                                {cat === "Empresas" && (
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
                                )}
                                {cat === "Liderazgo" && (
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                                )}
                                {cat === "Explora" && (
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" /></svg>
                                )}
                                {cat === "Bienestar" && (
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z" /></svg>
                                )}
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Grid de casos */}
            <section className="section">
                <div className="container">
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 380px), 1fr))",
                            gap: "2rem",
                        }}
                    >
                        {casos.map((caso, index) => (
                            <article
                                key={caso.id}
                                className="card animate-reveal"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "0.5rem",
                                        background: `${caso.color}15`,
                                        color: caso.color,
                                        padding: "0.375rem 0.875rem",
                                        borderRadius: "99px",
                                        fontSize: "0.75rem",
                                        fontWeight: 700,
                                        marginBottom: "1.5rem",
                                        border: `1px solid ${caso.color}30`,
                                        textTransform: "uppercase",
                                        letterSpacing: "0.05em",
                                    }}
                                >
                                    <IconTrendingUp />
                                    {caso.categoria}
                                </div>

                                <h3 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem", lineHeight: 1.2 }}>
                                    {caso.titulo}
                                </h3>
                                <p style={{ color: "var(--foreground-muted)", marginBottom: "1.5rem", fontSize: "1rem" }}>
                                    {caso.cliente}
                                </p>

                                <div style={{ marginBottom: "1.5rem" }}>
                                    <h4 style={{ fontWeight: 700, marginBottom: "0.5rem", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--foreground-muted)" }}>
                                        Contexto
                                    </h4>
                                    <p style={{ color: "var(--foreground-muted)", fontSize: "0.95rem", lineHeight: 1.6 }}>
                                        {caso.contexto}
                                    </p>
                                </div>

                                <div style={{ marginBottom: "1.5rem" }}>
                                    <h4 style={{ fontWeight: 700, marginBottom: "0.5rem", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--foreground-muted)" }}>
                                        Reto
                                    </h4>
                                    <p style={{ color: "var(--foreground-muted)", fontSize: "0.95rem", lineHeight: 1.6 }}>
                                        {caso.reto}
                                    </p>
                                </div>

                                <div style={{ marginBottom: "2rem" }}>
                                    <h4 style={{ fontWeight: 700, marginBottom: "0.75rem", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--foreground-muted)" }}>
                                        Resultados
                                    </h4>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                        {caso.resultados.map((resultado, i) => (
                                            <div
                                                key={i}
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "0.75rem",
                                                    padding: "0.75rem 1rem",
                                                    background: "rgba(255,255,255,0.03)",
                                                    borderRadius: "0.75rem",
                                                    border: "1px solid var(--border)",
                                                }}
                                            >
                                                <span style={{ color: caso.color }}><IconTrendingUp /></span>
                                                <span style={{ color: "var(--foreground)", fontSize: "0.9rem", fontWeight: 500 }}>{resultado}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <Link
                                    href={`https://wa.me/573183771838?text=Hola%20Mauro,%20vi%20el%20caso%20"${caso.titulo}"%20y%20me%20gustaría%20algo%20similar.`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-secondary"
                                    style={{
                                        width: "100%",
                                        justifyContent: "center",
                                    }}
                                >
                                    Quiero algo así
                                    <IconExternalLink />
                                </Link>
                            </article>
                        ))}
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
                    background: "radial-gradient(circle at center, rgba(58, 98, 184, 0.2), transparent 70%)",
                    zIndex: -1
                }} />

                <div className="container" style={{ position: "relative", zIndex: 1 }}>
                    <h2 className="section-title">
                        ¿Te gustaría llevar esto a tu contexto?
                    </h2>
                    <p className="section-subtitle" style={{ margin: "0 auto 2rem" }}>
                        Cada caso es único. Agenda una reunión de diagnóstico y diseñamos algo a tu medida.
                    </p>
                    <Link
                        href="https://wa.me/573183771838?text=Hola%20Mauro,%20quiero%20agendar%20un%20diagnóstico."
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
