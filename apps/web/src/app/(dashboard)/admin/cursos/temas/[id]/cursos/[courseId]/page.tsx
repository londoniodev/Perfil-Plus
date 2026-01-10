"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import ImageUploader from "@/app/components/admin/ImageUploader";
import LessonItem from "@/app/components/admin/lms/LessonItem";
import styles from "../../../../lms.module.css";
import { API_BASE } from "@/lib/config";

interface EditarCursoPageProps {
    params: Promise<{ id: string; courseId: string }>;
}

interface Lesson {
    id: string;
    title: string;
    slug: string;
    duration: number | null;
    order: number;
    published: boolean;
}

interface Course {
    id: string;
    title: string;
    description: string;
    coverImage: string | null;
    order: number;
    isFree: boolean;
    published: boolean;
    theme: {
        id: string;
        title: string;
    };
    lessons: Lesson[];
}

export default function EditarCursoPage({ params }: EditarCursoPageProps) {
    const { isAdmin, loading: authLoading } = useAuth();
    const router = useRouter();

    const [ids, setIds] = useState<{ id: string; courseId: string } | null>(null);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        coverImage: null as string | null,
        order: 0,
        isFree: false,
        published: false,
    });
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        params.then(setIds);
    }, [params]);

    useEffect(() => {
        if (ids && isAdmin) {
            fetchCourse();
        }
    }, [ids, isAdmin]);

    const fetchCourse = async () => {
        try {
            const res = await fetch(`${API_BASE}/admin/lms/courses/${ids!.courseId}`, {
                credentials: "include",
            });

            if (!res.ok) throw new Error("Curso no encontrado");

            const data: Course = await res.json();
            setCourse(data);
            setFormData({
                title: data.title,
                description: data.description,
                coverImage: data.coverImage,
                order: data.order,
                isFree: data.isFree,
                published: data.published,
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al cargar curso");
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || loading) {
        return <div className={styles.loading}>Cargando...</div>;
    }

    if (!isAdmin) {
        router.push("/perfil");
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            setError("El título es requerido");
            return;
        }

        setError(null);
        setSaving(true);

        try {
            const res = await fetch(`${API_BASE}/admin/lms/courses/${ids!.courseId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Error al guardar");
            }

            router.push(`/admin/cursos/temas/${ids!.id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error desconocido");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteLesson = async (lessonId: string) => {
        if (!confirm("¿Eliminar lección?")) return;

        try {
            const res = await fetch(`${API_BASE}/admin/lms/lessons/${lessonId}`, {
                method: "DELETE",
                credentials: "include",
            });

            if (!res.ok) throw new Error("Error al eliminar lección");

            setCourse((prev) => {
                if (!prev) return null;
                return {
                    ...prev,
                    lessons: prev.lessons.filter((l) => l.id !== lessonId),
                };
            });
        } catch (err) {
            alert(err instanceof Error ? err.message : "Error al eliminar");
        }
    };

    return (
        <div className={styles.formPage}>
            <Link href={`/admin/cursos/temas/${ids!.id}`} className={styles.backLink}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Volver al Tema: {course?.theme.title}
            </Link>

            <div className={styles.formCard}>
                <h1 className={styles.formTitle}>Editar Curso</h1>

                {error && <div className={styles.error}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Título *</label>
                        <input
                            type="text"
                            className={styles.formInput}
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Descripción *</label>
                        <textarea
                            className={`${styles.formInput} ${styles.formTextarea}`}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <ImageUploader
                            value={formData.coverImage}
                            onChange={(url) => setFormData({ ...formData, coverImage: url })}
                            label="Imagen de portada"
                            folder="lms-courses"
                        />
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Orden</label>
                            <input
                                type="number"
                                className={styles.formInput}
                                value={formData.order}
                                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                                min="0"
                            />
                        </div>
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <div className={styles.toggleGroup}>
                                <div className={styles.toggleLabel}>
                                    <span className={styles.toggleTitle}>Curso Gratuito</span>
                                    <span className={styles.toggleHint}>Disponible para todos los usuarios</span>
                                </div>
                                <button
                                    type="button"
                                    className={`${styles.toggle} ${formData.isFree ? styles.active : ""}`}
                                    onClick={() => setFormData({ ...formData, isFree: !formData.isFree })}
                                />
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <div className={styles.toggleGroup}>
                                <div className={styles.toggleLabel}>
                                    <span className={styles.toggleTitle}>Publicar</span>
                                    <span className={styles.toggleHint}>Hacer visible para usuarios</span>
                                </div>
                                <button
                                    type="button"
                                    className={`${styles.toggle} ${formData.published ? styles.active : ""}`}
                                    onClick={() => setFormData({ ...formData, published: !formData.published })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className={styles.formActions}>
                        <Link href={`/admin/cursos/temas/${ids!.id}`} className={styles.cancelBtn}>
                            Cancelar
                        </Link>
                        <button type="submit" className={styles.submitBtn} disabled={saving}>
                            {saving ? "Guardando..." : "Guardar Cambios"}
                        </button>
                    </div>
                </form>
            </div>

            {/* Lista de Lecciones */}
            <div className={styles.formCard} style={{ marginTop: "2rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                    <h2 className={styles.formTitle} style={{ marginBottom: 0 }}>Lecciones</h2>
                    <Link
                        href={`/admin/cursos/temas/${ids!.id}/cursos/${ids!.courseId}/lecciones/nuevo`}
                        className={styles.addBtn}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Agregar Lección
                    </Link>
                </div>

                {course?.lessons && course.lessons.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        {course.lessons.map((lesson) => (
                            <LessonItem
                                key={lesson.id}
                                lesson={lesson}
                                courseId={ids!.courseId}
                                themeId={ids!.id}
                                onDelete={handleDeleteLesson} // Necesito implementar esto
                            />
                        ))}
                    </div>
                ) : (
                    <div className={styles.emptyState} style={{ padding: "2rem" }}>
                        <p className={styles.emptyText} style={{ margin: 0 }}>
                            No hay lecciones en este curso.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
