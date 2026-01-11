"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { API_BASE } from "@/lib/config";
import BlogEditor from "@/app/components/admin/BlogEditor";
import VideoUploader from "@/app/components/admin/VideoUploader";
import LessonAttachmentManager from "@/app/components/admin/lms/LessonAttachmentManager";
import styles from "../../../../../../lms.module.css";

export default function EditarLeccionPage() {
    const params = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form state
    const [lesson, setLesson] = useState<any>(null);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [videoUrl, setVideoUrl] = useState("");
    const [videoType, setVideoType] = useState<"upload" | "youtube">("upload");
    const [duration, setDuration] = useState(0);
    const [order, setOrder] = useState(0);
    const [published, setPublished] = useState(false);

    // Fetch lesson data
    const fetchLesson = async () => {
        try {
            const res = await fetch(`${API_BASE}/admin/lms/lessons/${params.lessonId}`, {
                credentials: "include",
            });

            if (!res.ok) throw new Error("Error al cargar lección");

            const data = await res.json();
            setLesson(data);
            setTitle(data.title);
            setContent(data.content);
            setVideoUrl(data.videoUrl || "");

            // Determine video type
            if (data.videoUrl && (data.videoUrl.includes("youtube") || data.videoUrl.includes("youtu.be"))) {
                setVideoType("youtube");
            } else {
                setVideoType("upload");
            }

            setDuration(data.duration || 0);
            setOrder(data.order || 0);
            setPublished(data.published);
        } catch (err) {
            alert("Error al cargar datos");
            router.push(`/admin/cursos/temas/${params.id}/cursos/${params.courseId}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLesson();
    }, [params.lessonId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch(`${API_BASE}/admin/lms/lessons/${params.lessonId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    title,
                    content,
                    videoUrl,
                    duration: Number(duration),
                    order: Number(order),
                    published,
                }),
            });

            if (!res.ok) throw new Error("Error al actualizar lección");

            router.push(`/admin/cursos/temas/${params.id}/cursos/${params.courseId}`);
        } catch (err) {
            alert(err instanceof Error ? err.message : "Error al guardar");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className={styles.loading}>Cargando...</div>;

    return (
        <div className={styles.formPage}>
            <Link href={`/admin/cursos/temas/${params.id}/cursos/${params.courseId}`} className={styles.backLink}>
                ← Volver al curso
            </Link>

            <h1 className={styles.pageTitle}>Editar Lección</h1>

            <div className={styles.formCard}>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Título</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className={`${styles.formInput} ${styles.titleInput}`}
                            placeholder="Escribe un título claro para la lección"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M23 7l-7 5 7 5V7z" />
                                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                            </svg>
                            Video de la lección
                        </label>

                        <div className={styles.selectionGrid}>
                            <button
                                type="button"
                                onClick={() => { setVideoType("upload"); setVideoUrl(""); }}
                                className={`${styles.selectionCard} ${videoType === "upload" ? styles.active : ""}`}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                                    <polyline points="17 8 12 3 7 8" />
                                    <line x1="12" y1="3" x2="12" y2="15" />
                                </svg>
                                <span style={{ fontWeight: 600 }}>Subir Video</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => { setVideoType("youtube"); setVideoUrl(""); }}
                                className={`${styles.selectionCard} ${videoType === "youtube" ? styles.active : ""}`}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
                                    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
                                </svg>
                                <span style={{ fontWeight: 600 }}>YouTube</span>
                            </button>
                        </div>

                        {videoType === "upload" ? (
                            <VideoUploader
                                value={videoUrl}
                                onChange={(url) => setVideoUrl(url || "")}
                                folder="lms-videos"
                            />
                        ) : (
                            <input
                                type="text"
                                placeholder="https://www.youtube.com/watch?v=..."
                                value={videoUrl}
                                onChange={(e) => setVideoUrl(e.target.value)}
                                className={styles.formInput}
                            />
                        )}
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                </svg>
                                Duración (minutos)
                            </label>
                            <input
                                type="number"
                                value={duration}
                                onChange={(e) => setDuration(Number(e.target.value))}
                                min="0"
                                className={styles.formInput}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.formLabel} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="8" y1="6" x2="21" y2="6" />
                                    <line x1="8" y1="12" x2="21" y2="12" />
                                    <line x1="8" y1="18" x2="21" y2="18" />
                                    <line x1="3" y1="6" x2="3.01" y2="6" />
                                    <line x1="3" y1="12" x2="3.01" y2="12" />
                                    <line x1="3" y1="18" x2="3.01" y2="18" />
                                </svg>
                                Orden
                            </label>
                            <input
                                type="number"
                                value={order}
                                onChange={(e) => setOrder(Number(e.target.value))}
                                className={styles.formInput}
                            />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            Contenido / Descripción
                        </label>
                        <BlogEditor
                            value={content}
                            onChange={setContent}
                            placeholder="Escribe el contenido de la lección aquí..."
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <LessonAttachmentManager
                            lessonId={params.lessonId as string}
                            attachments={lesson.attachments || []}
                            onUpdate={fetchLesson}
                        />
                    </div>

                    <div className={styles.formGroup} style={{ marginTop: "1rem" }}>
                        <label className={styles.formLabel}>Estado de la lección</label>
                        <button
                            type="button"
                            onClick={() => setPublished(!published)}
                            className={`${styles.statusToggle} ${published ? styles.published : ""}`}
                        >
                            {published ? (
                                <>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                        <polyline points="22 4 12 14.01 9 11.01" />
                                    </svg>
                                    <span>Publicado (Visible para alumnos)</span>
                                </>
                            ) : (
                                <>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="15" y1="9" x2="9" y2="15" />
                                        <line x1="9" y1="9" x2="15" y2="15" />
                                    </svg>
                                    <span>Borrador (Oculto)</span>
                                </>
                            )}
                        </button>
                    </div>

                    <div className={styles.formActions}>
                        <Link
                            href={`/admin/cursos/temas/${params.id}/cursos/${params.courseId}`}
                            className={styles.cancelBtn}
                        >
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            className={styles.submitBtn}
                            disabled={saving}
                        >
                            {saving ? "Guardando..." : "Guardar Cambios"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
