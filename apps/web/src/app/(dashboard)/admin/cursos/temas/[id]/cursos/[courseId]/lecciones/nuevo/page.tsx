"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { API_BASE } from "@/lib/config";
import BlogEditor from "@/app/components/admin/BlogEditor";
import VideoUploader from "@/app/components/admin/VideoUploader";
import styles from "../../../../../../lms.module.css";

export default function NuevaLeccionPage() {
    const params = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Form state
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [videoUrl, setVideoUrl] = useState("");
    const [videoType, setVideoType] = useState<"upload" | "youtube">("upload");
    const [duration, setDuration] = useState(0);
    const [order, setOrder] = useState(0);
    const [published, setPublished] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE}/admin/lms/lessons`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    courseId: params.courseId,
                    title,
                    content,
                    videoUrl,
                    duration: Number(duration),
                    order: Number(order),
                    published,
                }),
            });

            if (!res.ok) throw new Error("Error al crear lección");

            router.push(`/admin/cursos/temas/${params.id}/cursos/${params.courseId}`);
        } catch (err) {
            alert(err instanceof Error ? err.message : "Error al guardar");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.formPage}>
            <Link href={`/admin/cursos/temas/${params.id}/cursos/${params.courseId}`} className={styles.backLink}>
                ← Volver al curso
            </Link>

            <h1 className={styles.pageTitle}>Nueva Lección</h1>

            <div className={styles.formCard}>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Título</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className={`${styles.input} ${styles.titleInput}`}
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
                        <div style={{ marginBottom: "1rem" }}>
                            <div style={{ display: "flex", gap: "1rem", marginBottom: "0.5rem" }}>
                                <button
                                    type="button"
                                    onClick={() => { setVideoType("upload"); setVideoUrl(""); }}
                                    style={{
                                        padding: "0.5rem 1rem",
                                        borderRadius: "0.25rem",
                                        background: videoType === "upload" ? "var(--primary)" : "var(--background)",
                                        color: videoType === "upload" ? "white" : "var(--foreground)",
                                        border: "1px solid var(--border)",
                                        cursor: "pointer"
                                    }}
                                >
                                    Subir Video
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setVideoType("youtube"); setVideoUrl(""); }}
                                    style={{
                                        padding: "0.5rem 1rem",
                                        borderRadius: "0.25rem",
                                        background: videoType === "youtube" ? "var(--primary)" : "var(--background)",
                                        color: videoType === "youtube" ? "white" : "var(--foreground)",
                                        border: "1px solid var(--border)",
                                        cursor: "pointer"
                                    }}
                                >
                                    YouTube
                                </button>
                            </div>
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
                                className={styles.input}
                            />
                        )}
                    </div>

                    <div className={styles.row}>
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

                    <div className={styles.formGroup} style={{ marginTop: "1rem" }}>
                        <label className={styles.formLabel}>Estado de la lección</label>
                        <button
                            type="button"
                            onClick={() => setPublished(!published)}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.75rem",
                                padding: "0.75rem 1.5rem",
                                borderRadius: "0.5rem",
                                border: "1px solid",
                                borderColor: published ? "#22c55e" : "var(--border)",
                                background: published ? "rgba(34, 197, 94, 0.1)" : "var(--background)",
                                color: published ? "#22c55e" : "var(--foreground-muted)",
                                cursor: "pointer",
                                transition: "all 0.2s",
                                width: "100%",
                                justifyContent: "center",
                                fontSize: "1rem",
                                fontWeight: 500
                            }}
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

                    <div className={styles.formActions} style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1rem" }}>
                        <Link
                            href={`/admin/cursos/temas/${params.id}/cursos/${params.courseId}`}
                            className={styles.cancelBtn}
                            style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                        >
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            className={styles.submitBtn}
                            disabled={loading}
                            style={{ background: "var(--accent)", fontSize: "1.1rem", padding: "1rem" }}
                        >
                            {loading ? "Guardando..." : "Crear Lección"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
