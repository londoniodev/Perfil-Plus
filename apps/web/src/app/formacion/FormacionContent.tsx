"use client";

import Link from "next/link";
import { IconTarget, IconBrain, IconZap } from "@/app/components/ui/Icons";
import styles from "@/app/styles/formacion.module.css";

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
            icon: <IconZap />, // Used Zap for "Bulb" (Idea/Energy) if Bulb unavailable
        }
    ];

    return (
        <div style={{ minHeight: "100vh" }}>
            {/* Hero Section */}
            <section className={styles.formacionHero}>
                <div className="container">
                    <span className={`animate-in fade-in slide-in-from-bottom-4 duration-500 ${styles.heroBadge}`}>
                        Formación Profesional
                    </span>
                    <h1 className={`animate-in fade-in slide-in-from-bottom-5 duration-700 delay-100 ${styles.heroTitle}`}>
                        Cursos que transforman carreras
                    </h1>
                    <p className={`animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200 ${styles.heroDesc}`}>
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
            <section className={styles.coursesContent}>
                <div className="container">
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                        <div className={styles.coursesGrid}>
                            {cursos.map((curso, index) => (
                                <div key={index} className={styles.courseCard}>
                                    <div className={styles.courseIconWrapper}>
                                        {curso.icon}
                                    </div>
                                    <h3 className={styles.courseTitle}>
                                        {curso.title}
                                    </h3>
                                    <p className={styles.courseDesc}>
                                        {curso.description}
                                    </p>
                                    <div className={styles.courseTags}>
                                        <span className={`${styles.courseTag} ${styles.tagLevel}`}>
                                            {curso.level}
                                        </span>
                                        <span className={`${styles.courseTag} ${styles.tagDuration}`}>
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
                </div>
            </section>

            {/* CTA Section */}
            <section className={styles.coursesCta}>
                <div className="container">
                    <h2>¿Listo para dar el siguiente paso?</h2>
                    <p style={{ maxWidth: "600px", margin: "1rem auto 2rem", color: "var(--foreground-muted)" }}>
                        Únete a cientos de profesionales que ya han transformado su carrera con nuestros programas.
                    </p>
                    <div className={styles.ctaButtons}>
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
