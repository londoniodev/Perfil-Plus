import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Portafolio | Casos y experiencias — Mauro Mera",
    description: "Casos de consultoría, talleres experienciales, programas de desarrollo, Explora y procesos de acompañamiento. Resultados, aprendizajes y metodología.",
};

const casos = [
    {
        id: 1,
        titulo: "Programa de cultura y liderazgo",
        cliente: "Empresa del sector financiero",
        categoria: "Empresas",
        contexto: "Una empresa de 500+ empleados enfrentaba desalineación entre la estrategia de crecimiento y la cultura interna. Los equipos de liderazgo no lograban sostener conversaciones difíciles.",
        reto: "Alinear la cultura organizacional con los objetivos estratégicos y desarrollar habilidades de liderazgo conversacional en mandos medios.",
        intervencion: "Diagnóstico de cultura de 4 semanas, programa de desarrollo de 6 meses con talleres mensuales y coaching individual a 15 líderes clave.",
        resultados: [
            "85% de mejora en indicadores de clima",
            "Reducción del 30% en rotación de equipos clave",
            "Nuevos rituales de conversación implementados",
        ],
    },
    {
        id: 2,
        titulo: "Escuela de ventas y servicio",
        cliente: "Empresa de retail",
        categoria: "Empresas",
        contexto: "Cadena de tiendas con 200+ puntos de venta buscaba mejorar la experiencia del cliente sin sacrificar el bienestar del equipo comercial.",
        reto: "Aumentar conversión y satisfacción del cliente mientras se cuida el bienestar de los colaboradores.",
        intervencion: "Diseño e implementación de escuela de ventas con enfoque humano. 12 talleres regionales + acompañamiento a gerentes de zona.",
        resultados: [
            "15% aumento en ticket promedio",
            "NPS de clientes subió 22 puntos",
            "Programa replicado en otras regiones",
        ],
    },
    {
        id: 3,
        titulo: "Proceso Explora institucional",
        cliente: "Institución educativa",
        categoria: "Explora",
        contexto: "Colegio con alta ansiedad vocacional en estudiantes de último año y familias demandando mayor acompañamiento.",
        reto: "Implementar un proceso de orientación vocacional escalable que integrara tecnología sin perder el componente humano.",
        intervencion: "Piloto con 60 estudiantes: evaluaciones, sesiones 1:1, app con IA para explicación de resultados, talleres con padres.",
        resultados: [
            "92% de satisfacción de familias",
            "80% de estudiantes tomaron decisión con mayor seguridad",
            "El colegio lo adoptó como programa permanente",
        ],
    },
    {
        id: 4,
        titulo: "Transformación de mandos medios",
        cliente: "Empresa de manufactura",
        categoria: "Liderazgo",
        contexto: "Supervisores promovidos sin formación en liderazgo, generando conflictos y alta rotación en sus equipos.",
        reto: "Desarrollar competencias de liderazgo y comunicación en 25 supervisores de planta.",
        intervencion: "Programa de 8 meses: taller mensual + coaching grupal + herramientas prácticas de retroalimentación.",
        resultados: [
            "40% reducción en conflictos laborales",
            "Mejora en evaluaciones de desempeño del equipo",
            "Supervisores como multiplicadores internos",
        ],
    },
    {
        id: 5,
        titulo: "Proceso Explora familiar",
        cliente: "Familia (caso anónimo)",
        categoria: "Explora",
        contexto: "Joven de 17 años con alta ansiedad por la decisión de carrera, presión familiar y confusión sobre sus intereses reales.",
        reto: "Clarificar perfil vocacional e intereses genuinos, separándolos de expectativas externas.",
        intervencion: "5 sesiones individuales + 2 familiares + uso de app IA para explorar opciones + informe final.",
        resultados: [
            "Claridad sobre 3 opciones viables",
            "Reducción significativa de ansiedad",
            "Familia alineada en el acompañamiento",
        ],
    },
    {
        id: 6,
        titulo: "Taller de bienestar y propósito",
        cliente: "Equipo directivo de ONG",
        categoria: "Bienestar",
        contexto: "Equipo de 12 personas con alto compromiso pero síntomas de agotamiento y pérdida de sentido.",
        reto: "Reconectar al equipo con el propósito y establecer límites saludables.",
        intervencion: "Retiro de 2 días con metodología experiencial + seguimiento de 3 meses.",
        resultados: [
            "Nuevo acuerdo de equipo sobre límites",
            "Renovación del compromiso con la misión",
            "Herramientas de autocuidado implementadas",
        ],
    },
];

const categorias = ["Todos", "Empresas", "Liderazgo", "Explora", "Bienestar"];

export default function PortafolioPage() {
    return (
        <>
            {/* Hero */}
            <section style={{
                paddingTop: '120px',
                paddingBottom: '80px',
                background: 'linear-gradient(135deg, var(--background) 0%, #e2e8f0 100%)',
                textAlign: 'center',
            }}>
                <div className="container">
                    <h1 style={{
                        fontSize: '3rem',
                        fontWeight: 800,
                        marginBottom: '1rem',
                    }}>
                        Portafolio: casos, experiencias y aprendizajes
                    </h1>
                    <p style={{
                        fontSize: '1.25rem',
                        color: 'var(--secondary)',
                        marginBottom: '2rem',
                        maxWidth: '700px',
                        margin: '0 auto 2rem',
                    }}>
                        Trabajo con foco en transformación aplicable: claridad, conversación y acción sostenida.
                    </p>
                    <a href="#agendar" className="btn btn-primary">
                        Quiero un diagnóstico
                    </a>
                </div>
            </section>

            {/* Filtros */}
            <section style={{ padding: '2rem 0', borderBottom: '1px solid var(--border)' }}>
                <div className="container">
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        {categorias.map((cat, i) => (
                            <button
                                key={i}
                                style={{
                                    padding: '0.625rem 1.5rem',
                                    borderRadius: '9999px',
                                    border: '1px solid var(--border)',
                                    background: i === 0 ? 'var(--primary)' : 'transparent',
                                    color: i === 0 ? 'white' : 'var(--foreground)',
                                    cursor: 'pointer',
                                    fontWeight: 500,
                                    transition: 'all 0.2s',
                                }}
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
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                        gap: '2rem',
                    }}>
                        {casos.map((caso) => (
                            <article key={caso.id} className="card">
                                <div style={{
                                    display: 'inline-block',
                                    background: 'var(--primary)',
                                    color: 'white',
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '9999px',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    marginBottom: '1rem',
                                }}>
                                    {caso.categoria}
                                </div>

                                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                                    {caso.titulo}
                                </h3>
                                <p style={{ color: 'var(--secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                                    {caso.cliente}
                                </p>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <h4 style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>Contexto</h4>
                                    <p style={{ color: 'var(--secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                                        {caso.contexto}
                                    </p>
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <h4 style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>Reto</h4>
                                    <p style={{ color: 'var(--secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                                        {caso.reto}
                                    </p>
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <h4 style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>Intervención</h4>
                                    <p style={{ color: 'var(--secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                                        {caso.intervencion}
                                    </p>
                                </div>

                                <div>
                                    <h4 style={{ fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.9rem' }}>Resultados</h4>
                                    <ul style={{ paddingLeft: '1rem' }}>
                                        {caso.resultados.map((resultado, i) => (
                                            <li key={i} style={{
                                                color: 'var(--primary)',
                                                fontSize: '0.9rem',
                                                marginBottom: '0.5rem',
                                            }}>
                                                {resultado}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Final */}
            <section id="agendar" style={{
                padding: '6rem 0',
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)',
                color: 'white',
                textAlign: 'center',
            }}>
                <div className="container">
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem' }}>
                        ¿Te gustaría llevar esto a tu contexto?
                    </h2>
                    <p style={{ fontSize: '1.125rem', opacity: 0.9, marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
                        Cada caso es único. Agenda una reunión de diagnóstico y diseñamos algo a tu medida.
                    </p>
                    <a href="mailto:contacto@mauromera.com" className="btn" style={{
                        background: 'white',
                        color: 'var(--primary)',
                        fontSize: '1.125rem',
                        padding: '1rem 2.5rem',
                    }}>
                        Agendar diagnóstico
                    </a>
                </div>
            </section>
        </>
    );
}
