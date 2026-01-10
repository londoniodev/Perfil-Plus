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

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                    <label>Título</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className={styles.input}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>Video de la lección</label>
                    <VideoUploader
                        value={videoUrl}
                        onChange={(url) => setVideoUrl(url || "")}
                        folder="lms-videos"
                    />
                </div>

                <div className={styles.row}>
                    <div className={styles.formGroup}>
                        <label>Duración (minutos)</label>
                        <input
                            type="number"
                            value={duration}
                            onChange={(e) => setDuration(Number(e.target.value))}
                            min="0"
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Orden</label>
                        <input
                            type="number"
                            value={order}
                            onChange={(e) => setOrder(Number(e.target.value))}
                            className={styles.input}
                        />
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label>Contenido / Descripción</label>
                    <BlogEditor
                        value={content}
                        onChange={setContent}
                        placeholder="Escribe el contenido de la lección aquí..."
                    />
                </div>

                <div className={styles.checkboxGroup}>
                    <label>
                        <input
                            type="checkbox"
                            checked={published}
                            onChange={(e) => setPublished(e.target.checked)}
                        />
                        Publicar lección
                    </label>
                </div>

                <div className={styles.actions}>
                    <Link
                        href={`/admin/cursos/temas/${params.id}/cursos/${params.courseId}`}
                        className={styles.cancelBtn}
                    >
                        Cancelar
                    </Link>
                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                        {loading ? "Guardando..." : "Crear Lección"}
                    </button>
                </div>
            </form>
        </div>
    );
}
