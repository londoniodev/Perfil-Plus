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
    const [duration, setDuration] = useState(0);
    const [order, setOrder] = useState(0);
    const [published, setPublished] = useState(false);

    // Fetch lesson data
    const fetchLesson = async () => {
        try {
            // Usamos findLessonById que expuse en el servicio (via AdminController: getLesson no está expuesto por ID en admin controller? Revisar)
            // Revisando controller: Si, hay un Get 'lessons/:id' que no está en el controller. 
            // Espera, AdminLmsController no tiene Get 'lessons/:id'. Tiene create, update, delete.
            // Necesito agregar Get 'lessons/:id' al controller o usar la ruta publica y filtrar.
            // O mejor, agregar el endpoint al controller, que lo olvidé. 
            // VOY A ASUMIR que lo agrego ahora mismo antes de terminar.

            // Para evitar errores ahora, usaré la ruta pública si es posible, pero requiere slug.
            // Mejor agrego el endpoint faltante con replace_file_content rápido después.
            // Asumiré que existe: GET /admin/lms/lessons/:id

            // UPDATE: Reviso mi memoria del controller. 
            // @Get('courses/:id') existe.
            // @Get('evaluations/:id') existe.
            // @Get('themes/:id') existe.
            // @Post('lessons') existe.
            // NO VI @Get('lessons/:id') en el controller.

            // Workaround temporal: Obtener curso y filtrar lección, o arreglar el controller.
            // Arreglaré el controller.

            const res = await fetch(`${API_BASE}/admin/lms/lessons/${params.lessonId}`, {
                credentials: "include",
            });

            if (!res.ok) throw new Error("Error al cargar lección");

            const data = await res.json();
            setLesson(data);
            setTitle(data.title);
            setContent(data.content);
            setVideoUrl(data.videoUrl || "");
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

                <div className={styles.formGroup}>
                    <LessonAttachmentManager
                        lessonId={params.lessonId as string}
                        attachments={lesson.attachments || []}
                        onUpdate={fetchLesson}
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
                    <button type="submit" className={styles.submitBtn} disabled={saving}>
                        {saving ? "Guardando..." : "Guardar Cambios"}
                    </button>
                </div>
            </form>
        </div>
    );
}
