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
                className="grid-pattern"
                style={{
                    paddingTop: "140px",
                    paddingBottom: "80px",
                    background: "linear-gradient(135deg, var(--background) 0%, var(--gradient-end) 100%)",
                    textAlign: "center",
                }}
            >
                <div className="container">
                    <h1
                        style={{
                            fontSize: "3rem",
                            fontWeight: 700,
                            marginBottom: "1rem",
                            letterSpacing: "-0.03em",
                        }}
                    >
                        Portafolio: casos, experiencias y aprendizajes
                    </h1>
                    <p
                        style={{
                            fontSize: "1.125rem",
                            color: "var(--foreground-muted)",
                            marginBottom: "2.5rem",
                            maxWidth: "700px",
                            margin: "0 auto 2.5rem",
                            lineHeight: 1.7,
                        }}
                    >
                        Trabajo con foco en transformación aplicable: claridad, conversación y acción sostenida.
                    </p>
                    <Link href="#agendar" className="btn btn-primary">
                        <IconCalendar />
                        Quiero un diagnóstico
                    </Link>
                </div>
            </section>

            {/* Filtros */}
            <section style={{ padding: "2rem 0", borderBottom: "1px solid var(--border)", background: "var(--background-secondary)" }}>
                <div className="container">
                    <div style={{ display: "flex", justifyContent: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                        {categorias.map((cat, i) => (
                            <button
                                key={i}
                                className={i === 0 ? "btn btn-primary" : "btn btn-ghost"}
                                style={{ padding: "0.5rem 1.25rem", fontSize: "0.875rem" }}
                            >
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
                            gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
                            gap: "1.5rem",
                        }}
                    >
                        {casos.map((caso) => (
                            <article key={caso.id} className="card">
                                <div
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "0.5rem",
                                        background: `${caso.color}20`,
                                        color: caso.color,
                                        padding: "0.375rem 0.875rem",
                                        borderRadius: "9999px",
                                        fontSize: "0.75rem",
                                        fontWeight: 600,
                                        marginBottom: "1rem",
                                    }}
                                >
                                    <IconTrendingUp />
                                    {caso.categoria}
                                </div>

                                <h3 style={{ fontSize: "1.125rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                                    {caso.titulo}
                                </h3>
                                <p style={{ color: "var(--foreground-muted)", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
                                    {caso.cliente}
                                </p>

                                <div style={{ marginBottom: "1rem" }}>
                                    <h4 style={{ fontWeight: 600, marginBottom: "0.5rem", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--foreground-muted)" }}>
                                        Contexto
                                    </h4>
                                    <p style={{ color: "var(--foreground-muted)", fontSize: "0.9rem", lineHeight: 1.6 }}>
                                        {caso.contexto}
                                    </p>
                                </div>

                                <div style={{ marginBottom: "1rem" }}>
                                    <h4 style={{ fontWeight: 600, marginBottom: "0.5rem", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--foreground-muted)" }}>
                                        Reto
                                    </h4>
                                    <p style={{ color: "var(--foreground-muted)", fontSize: "0.9rem", lineHeight: 1.6 }}>
                                        {caso.reto}
                                    </p>
                                </div>

                                <div style={{ marginBottom: "1.5rem" }}>
                                    <h4 style={{ fontWeight: 600, marginBottom: "0.75rem", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--foreground-muted)" }}>
                                        Resultados
                                    </h4>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                        {caso.resultados.map((resultado, i) => (
                                            <div
                                                key={i}
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "0.5rem",
                                                    padding: "0.5rem 0.75rem",
                                                    background: "var(--background)",
                                                    borderRadius: "0.5rem",
                                                    border: "1px solid var(--border)",
                                                }}
                                            >
                                                <span style={{ color: caso.color }}><IconTrendingUp /></span>
                                                <span style={{ color: "var(--foreground)", fontSize: "0.9rem" }}>{resultado}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <Link
                                    href="#agendar"
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "0.5rem",
                                        color: caso.color,
                                        textDecoration: "none",
                                        fontSize: "0.9rem",
                                        fontWeight: 600,
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
                    padding: "6rem 0",
                    background: "linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 100%)",
                    textAlign: "center",
                }}
            >
                <div className="container">
                    <h2 style={{ fontSize: "2.5rem", fontWeight: 700, marginBottom: "1rem", color: "white" }}>
                        ¿Te gustaría llevar esto a tu contexto?
                    </h2>
                    <p style={{ fontSize: "1.125rem", opacity: 0.9, marginBottom: "2rem", maxWidth: "600px", margin: "0 auto 2rem", color: "white" }}>
                        Cada caso es único. Agenda una reunión de diagnóstico y diseñamos algo a tu medida.
                    </p>
                    <Link
                        href="mailto:contacto@mauromera.com"
                        className="btn"
                        style={{ background: "white", color: "var(--primary-dark)", fontSize: "1rem", padding: "1rem 2rem" }}
                    >
                        <IconCalendar />
                        Agendar diagnóstico
                    </Link>
                </div>
            </section>
        </>
    );
}
