"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import styles from "./lesson.module.css";

interface LessonData {
    id: string;
    title: string;
    content: string;
    videoUrl: string | null;
    duration: number | null;
    course: {
        id: string;
        title: string;
        slug: string;
        theme: { id: string; title: string; slug: string };
    };
    navigation: {
        prev: { slug: string; title: string } | null;
        next: { slug: string; title: string } | null;
    };
    userProgress: { completed: boolean; watchedTime: number };
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export default function LessonPage({
    params,
}: {
    params: Promise<{ slug: string; courseSlug: string; lessonSlug: string }>;
}) {
    const [lesson, setLesson] = useState<LessonData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [completed, setCompleted] = useState(false);
    const [paramsData, setParamsData] = useState<{ slug: string; courseSlug: string; lessonSlug: string } | null>(null);

    useEffect(() => {
        params.then(setParamsData);
    }, [params]);

    useEffect(() => {
        if (!paramsData) return;
        fetchLesson();
    }, [paramsData]);

    const fetchLesson = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setError("needsAuth");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(
                `${API_BASE}/lms/courses/${paramsData!.courseSlug}/lessons/${paramsData!.lessonSlug}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.status === 403) {
                setError("premium");
                setLoading(false);
                return;
            }

            if (!res.ok) throw new Error("Lección no encontrada");

            const data = await res.json();
            setLesson(data);
            setCompleted(data.userProgress?.completed || false);
        } catch (err) {
            setError("notFound");
        } finally {
            setLoading(false);
        }
    };

    const markAsComplete = async () => {
        if (!lesson) return;
        const token = localStorage.getItem("token");

        try {
            await fetch(`${API_BASE}/lms/progress/${lesson.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ completed: true }),
            });
            setCompleted(true);
        } catch (err) {
            console.error("Error updating progress");
        }
    };

    if (loading) {
        return (
            <div className={styles.lessonPage}>
                <div className="container" style={{ padding: "10rem 0", textAlign: "center" }}>
                    Cargando...
                </div>
            </div>
        );
    }

    if (error === "needsAuth") {
        return (
            <div className={styles.lessonPage}>
                <div className="container" style={{ padding: "10rem 0", textAlign: "center" }}>
                    <div className={styles.premiumBlock}>
                        <div className={styles.premiumIcon}>🔐</div>
                        <h2>Inicia sesión para ver esta lección</h2>
                        <p>Necesitas una cuenta para acceder al contenido del curso.</p>
                        <Link href="/admin/login" className="btn btn-primary">
                            Iniciar Sesión
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (error === "premium") {
        return (
            <div className={styles.lessonPage}>
                <div className="container" style={{ padding: "10rem 0", textAlign: "center" }}>
                    <div className={styles.premiumBlock}>
                        <div className={styles.premiumIcon}>🔒</div>
                        <h2>Contenido Premium</h2>
                        <p>Necesitas una suscripción activa para acceder a este contenido.</p>
                        <Link href="/suscripcion" className="btn btn-primary">
                            Ver Planes
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !lesson) {
        return (
            <div className={styles.lessonPage}>
                <div className="container" style={{ padding: "10rem 0", textAlign: "center" }}>
                    <h2>Lección no encontrada</h2>
                    <Link href="/cursos" style={{ color: "var(--primary)" }}>
                        Volver a cursos
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.lessonPage}>
            <header className={styles.lessonHeader}>
                <div className="container">
                    <div className={styles.breadcrumb}>
                        <Link href="/cursos">Cursos</Link>
                        <span>/</span>
                        <Link href={`/cursos/${lesson.course.theme.slug}`}>{lesson.course.theme.title}</Link>
                        <span>/</span>
                        <Link href={`/cursos/${lesson.course.theme.slug}/${lesson.course.slug}`}>
                            {lesson.course.title}
                        </Link>
                    </div>
                    <h1 className={styles.lessonTitle}>{lesson.title}</h1>
                    <div className={styles.lessonMeta}>
                        {lesson.duration && (
                            <span>⏱️ {Math.floor(lesson.duration / 60)} min</span>
                        )}
                        {completed && <span style={{ color: "#22c55e" }}>✓ Completada</span>}
                    </div>
                </div>
            </header>

            <section className={styles.lessonContent}>
                <div className={`container ${styles.contentWrapper}`}>
                    {lesson.videoUrl && (
                        <div className={styles.videoContainer}>
                            <video controls src={lesson.videoUrl}>
                                Tu navegador no soporta el elemento de video.
                            </video>
                        </div>
                    )}

                    <div
                        className={styles.contentText}
                        dangerouslySetInnerHTML={{ __html: formatContent(lesson.content) }}
                    />

                    <div className={styles.progressActions}>
                        <button
                            onClick={markAsComplete}
                            className={`${styles.markComplete} ${completed ? styles.completed : ""}`}
                            disabled={completed}
                        >
                            {completed ? "✓ Completada" : "Marcar como completada"}
                        </button>
                    </div>

                    <div className={styles.lessonNav}>
                        {lesson.navigation.prev && (
                            <Link
                                href={`/cursos/${lesson.course.theme.slug}/${lesson.course.slug}/${lesson.navigation.prev.slug}`}
                                className={`${styles.navLink} ${styles.prev}`}
                            >
                                <span className={styles.navLabel}>← Anterior</span>
                                <span className={styles.navTitle}>{lesson.navigation.prev.title}</span>
                            </Link>
                        )}
                        {lesson.navigation.next && (
                            <Link
                                href={`/cursos/${lesson.course.theme.slug}/${lesson.course.slug}/${lesson.navigation.next.slug}`}
                                className={`${styles.navLink} ${styles.next}`}
                            >
                                <span className={styles.navLabel}>Siguiente →</span>
                                <span className={styles.navTitle}>{lesson.navigation.next.title}</span>
                            </Link>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}

function formatContent(content: string): string {
    if (!content) return "";
    if (content.includes("<p>") || content.includes("<div>")) return content;
    return content
        .split(/\n\n+/)
        .map((p) => `<p>${p.replace(/\n/g, "<br/>")}</p>`)
        .join("");
}
