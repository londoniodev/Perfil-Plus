"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import styles from "@/app/styles/lesson.module.css";
import { API_BASE } from "@/lib/config";
import { useAuth } from "@/context/AuthContext";
import { sanitizeHtml } from "@/lib/sanitize";

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

export default function LessonPage({
    params,
}: {
    params: Promise<{ slug: string; courseSlug: string; lessonSlug: string }>;
}) {
    const { isAuthenticated, loading: authLoading, user } = useAuth();
    const [lesson, setLesson] = useState<LessonData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [completed, setCompleted] = useState(false);
    const [paramsData, setParamsData] = useState<{ slug: string; courseSlug: string; lessonSlug: string } | null>(null);

    useEffect(() => {
        params.then(setParamsData);
    }, [params]);

    const fetchLesson = useCallback(async () => {
        if (!paramsData) return;

        // Wait for auth to initialize
        if (authLoading) return;

        if (!isAuthenticated) {
            setError("needsAuth");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(
                `${API_BASE}/lms/courses/${paramsData.courseSlug}/lessons/${paramsData.lessonSlug}`,
                {
                    credentials: "include" // Use cookies
                }
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
            console.error("Error fetching lesson:", err);
            setError("notFound");
        } finally {
            setLoading(false);
        }
    }, [paramsData, authLoading, isAuthenticated]);

    useEffect(() => {
        fetchLesson();
    }, [fetchLesson]);

    const markAsComplete = async () => {
        if (!lesson) return;

        try {
            await fetch(`${API_BASE}/lms/progress/${lesson.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include", // Use cookies
                body: JSON.stringify({ completed: true }),
            });
            setCompleted(true);
        } catch (err) {
            console.error("Error updating progress");
        }
    };

    if (loading || authLoading) {
        return (
            <div className={styles.lessonPage}>
                <div className="container state-container">
                    Cargando...
                </div>
            </div>
        );
    }

    if (error === "needsAuth" || !isAuthenticated) {
        return (
            <div className={styles.lessonPage}>
                <div className="container state-container">
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
                <div className="container state-container">
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

    if (error === "notFound" || !lesson) {
        return (
            <div className={styles.lessonPage}>
                <div className="container state-container">
                    <h2>Lección no encontrada</h2>
                    <Link href="/cursos" className="dashboard-link">
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
                        {completed && <span className="status-completed">✓ Completada</span>}
                    </div>
                </div>
            </header>

            <section className={styles.lessonContent}>
                <div className={`container ${styles.contentWrapper}`}>
                    {lesson.videoUrl && (
                        <div className={styles.videoContainer}>
                            {getYouTubeEmbedUrl(lesson.videoUrl) ? (
                                <iframe
                                    src={getYouTubeEmbedUrl(lesson.videoUrl) || ""}
                                    title={lesson.title}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    style={{
                                        border: "none",
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        width: "100%",
                                        height: "100%",
                                    }}
                                />
                            ) : (
                                <video controls src={lesson.videoUrl}>
                                    Tu navegador no soporta el elemento de video.
                                </video>
                            )}
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

function getYouTubeEmbedUrl(url: string): string | null {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    if (match && match[2].length === 11) {
        return `https://www.youtube.com/embed/${match[2]}`;
    }
    return null;
}

function formatContent(content: string): string {
    if (!content) return "";

    let formatted = content;

    // Si NO tiene HTML, convertir saltos de línea en párrafos
    if (!content.includes("<p>") && !content.includes("<div>")) {
        formatted = content
            .split(/\n\n+/)
            .map((p) => `<p>${p.replace(/\n/g, "<br/>")}</p>`)
            .join("");
    }

    // Sanitizar para prevenir XSS
    return sanitizeHtml(formatted);
}
