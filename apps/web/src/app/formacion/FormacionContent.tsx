"use client";

import Link from "next/link";

export default function FormacionContent() {
    const cursos = [
        {
            title: "Liderazgo Transformacional",
            description: "Desarrolla las habilidades necesarias para liderar equipos de alto rendimiento y generar impacto positivo en tu organización.",
            level: "Intermedio",
            duration: "8 semanas",
            icon: "🎯"
        },
        {
            title: "Psicología Organizacional",
            description: "Comprende el comportamiento humano en el contexto laboral y mejora el clima organizacional de tu empresa.",
            level: "Básico",
            duration: "6 semanas",
            icon: "🧠"
        },
        {
            title: "Inteligencia Emocional",
            description: "Aprende a gestionar tus emociones y las de tu equipo para mejorar la comunicación y productividad.",
            level: "Básico",
            duration: "4 semanas",
            icon: "💡"
        }
    ];

    return (
        <div style={{ paddingTop: "100px", minHeight: "100vh" }}>
            {/* Hero Section */}
            <section style={{ padding: "4rem 0", textAlign: "center" }}>
                <div className="container">
                    <span className="badge" style={{ marginBottom: "1.5rem" }}>Formación Profesional</span>
                    <h1 className="section-title" style={{ maxWidth: "800px", margin: "0 auto 1.5rem" }}>
                        Cursos que transforman carreras
                    </h1>
                    <p className="section-subtitle" style={{ maxWidth: "600px", margin: "0 auto 2rem" }}>
                        Programas diseñados para desarrollar líderes, mejorar equipos y potenciar organizaciones
                        con enfoque en psicología aplicada y desarrollo personal.
                    </p>
                    <Link href="/login?redirect=/cursos" className="btn btn-primary">
                        Comenzar Ahora
                    </Link>
                </div>
            </section>

            {/* Courses Grid */}
            <section className="section" style={{ background: "var(--background-secondary)" }}>
                <div className="container">
                    <h2 style={{
                        fontSize: "1.5rem",
                        fontWeight: 600,
                        marginBottom: "2rem",
                        color: "var(--foreground)"
                    }}>
                        Próximos Cursos
                    </h2>
                    <div className="grid-responsive">
                        {cursos.map((curso, index) => (
                            <div key={index} className="card" style={{ padding: "2rem" }}>
                                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>{curso.icon}</div>
                                <h3 style={{
                                    fontSize: "1.25rem",
                                    fontWeight: 600,
                                    marginBottom: "0.75rem",
                                    color: "var(--foreground)"
                                }}>
                                    {curso.title}
                                </h3>
                                <p style={{
                                    color: "var(--foreground-muted)",
                                    marginBottom: "1.5rem",
                                    lineHeight: "1.6"
                                }}>
                                    {curso.description}
                                </p>
                                <div style={{
                                    display: "flex",
                                    gap: "1rem",
                                    flexWrap: "wrap",
                                    marginBottom: "1.5rem"
                                }}>
                                    <span style={{
                                        background: "rgba(91, 141, 239, 0.1)",
                                        color: "var(--primary-light)",
                                        padding: "0.25rem 0.75rem",
                                        borderRadius: "999px",
                                        fontSize: "0.8rem"
                                    }}>
                                        {curso.level}
                                    </span>
                                    <span style={{
                                        background: "rgba(255, 255, 255, 0.05)",
                                        color: "var(--foreground-muted)",
                                        padding: "0.25rem 0.75rem",
                                        borderRadius: "999px",
                                        fontSize: "0.8rem"
                                    }}>
                                        {curso.duration}
                                    </span>
                                </div>
                                <Link
                                    href="/login?redirect=/cursos"
                                    className="btn btn-secondary"
                                    style={{ width: "100%", justifyContent: "center" }}
                                >
                                    Ver Detalles
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="section" style={{ textAlign: "center" }}>
                <div className="container">
                    <h2 style={{
                        fontSize: "2rem",
                        fontWeight: 700,
                        marginBottom: "1rem",
                        color: "var(--foreground)"
                    }}>
                        ¿Listo para dar el siguiente paso?
                    </h2>
                    <p style={{
                        color: "var(--foreground-muted)",
                        marginBottom: "2rem",
                        maxWidth: "500px",
                        margin: "0 auto 2rem"
                    }}>
                        Únete a cientos de profesionales que ya han transformado su carrera con nuestros programas.
                    </p>
                    <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
                        <Link href="/login?redirect=/cursos" className="btn btn-primary">
                            Inscribirme Ahora
                        </Link>
                        <Link href="/servicios" className="btn btn-secondary">
                            Conocer Servicios
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
