"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { API_BASE } from "@/lib/config";
import BlogEditor from "@/components/admin/blog/BlogEditor";
import VideoUploader from "@/components/admin/ui/VideoUploader";
import { useToast } from "@/components/ui/Toast";
import styles from "@/styles/lms.module.css";
import { IconVideo, IconUpload, IconPlay, IconClock, IconList, IconDocument, IconSuccess, IconEyeOff, IconBack } from "@/components/ui/Icons";

export default function NuevaLeccionPage() {
    const params = useParams();
    const router = useRouter();
    const toast = useToast();
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

            toast.success("Lección creada correctamente");
            router.push(`/admin/cursos/temas/${params.id}/cursos/${params.courseId}`);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Error al guardar");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.formPage}>
            <Link href={`/admin/cursos/temas/${params.id}/cursos/${params.courseId}`} className={styles.backLink}>
                <IconBack size={16} />
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
                            className={`${styles.formInput} ${styles.titleInput}`}
                            placeholder="Escribe un título claro para la lección"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <IconVideo size={18} />
                            Video de la lección
                        </label>

                        <div className={styles.selectionGrid}>
                            <button
                                type="button"
                                onClick={() => { setVideoType("upload"); setVideoUrl(""); }}
                                className={`${styles.selectionCard} ${videoType === "upload" ? styles.active : ""}`}
                            >
                                <IconUpload size={24} />
                                <span style={{ fontWeight: 600 }}>Subir Video</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => { setVideoType("youtube"); setVideoUrl(""); }}
                                className={`${styles.selectionCard} ${videoType === "youtube" ? styles.active : ""}`}
                            >
                                <IconPlay size={24} />
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
                                <IconClock size={18} />
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
                                <IconList size={18} />
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
                            <IconDocument size={18} />
                            Contenido / Descripción
                        </label>
                        <BlogEditor
                            value={content}
                            onChange={setContent}
                            placeholder="Escribe el contenido de la lección aquí..."
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Estado de la lección</label>
                        <button
                            type="button"
                            onClick={() => setPublished(!published)}
                            className={`${styles.statusToggle} ${published ? styles.published : ""}`}
                        >
                            {published ? (
                                <>
                                    <IconSuccess size={20} />
                                    <span>Publicado (Visible para alumnos)</span>
                                </>
                            ) : (
                                <>
                                    <IconEyeOff size={20} />
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
                            disabled={loading}
                        >
                            {loading ? "Guardando..." : "Crear Lección"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
