"use client";

import Link from "next/link";
import { IconTarget, IconBrain, IconBulb } from "../components/icons";

export default function FormacionContent() {
    const cursos = [
        {
            title: "Liderazgo Transformacional",
            description: "Desarrolla las habilidades necesarias para liderar equipos de alto rendimiento y generar impacto positivo en tu organización.",
            level: "Intermedio",
            duration: "8 semanas",
            icon: <IconTarget />,
        },
        {
            title: "Psicología Organizacional",
            description: "Comprende el comportamiento humano en el contexto laboral y mejora el clima organizacional de tu empresa.",
            level: "Básico",
            duration: "6 semanas",
            icon: <IconBrain />,
        },
        {
            title: "Inteligencia Emocional",
            description: "Aprende a gestionar tus emociones y las de tu equipo para mejorar la comunicación y productividad.",
            level: "Básico",
            duration: "4 semanas",
            icon: <IconBulb />,
        }
    ];

    return (
        <div style={{ minHeight: "100vh" }}>
            {/* Hero Section */}
            <section className="courses-hero">
                <div className="container">
                    <span className="hero-badge animate-in fade-in slide-in-from-bottom-4 duration-500">
                        Formación Profesional
                    </span>
                    <h1 className="animate-in fade-in slide-in-from-bottom-5 duration-700 delay-100">
                        Cursos que transforman carreras
                    </h1>
                    <p className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
                        Programas diseñados para desarrollar líderes, mejorar equipos y potenciar organizaciones
                        con enfoque en psicología aplicada y desarrollo personal.
                    </p>
                    <div className="animate-in fade-in slide-in-from-bottom-7 duration-700 delay-300">
                        <Link href="/login?redirect=/cursos" className="btn btn-primary" style={{ padding: "0.8rem 2rem", fontSize: "1rem" }}>
                            Comenzar Ahora
                        </Link>
                    </div>
                </div>
            </section>

            {/* Courses Grid */}
            <section className="courses-content">
                <div className="container">
                    <div className="courses-grid animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                        {cursos.map((curso, index) => (
                            <div key={index} className="course-card">
                                <div className="course-icon-wrapper">
                                    {curso.icon}
                                </div>
                                <h3 className="course-title">
                                    {curso.title}
                                </h3>
                                <p className="course-desc">
                                    {curso.description}
                                </p>
                                <div className="course-tags">
                                    <span className="course-tag tag-level">
                                        {curso.level}
                                    </span>
                                    <span className="course-tag tag-duration">
                                        {curso.duration}
                                    </span>
                                </div>
                                <Link
                                    href="/login?redirect=/cursos"
                                    className="btn btn-secondary"
                                    style={{ width: "100%", justifyContent: "center", marginTop: "auto" }}
                                >
                                    Ver Detalles
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="courses-cta">
                <div className="container">
                    <h2>¿Listo para dar el siguiente paso?</h2>
                    <p>
                        Únete a cientos de profesionales que ya han transformado su carrera con nuestros programas.
                    </p>
                    <div className="cta-buttons">
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
