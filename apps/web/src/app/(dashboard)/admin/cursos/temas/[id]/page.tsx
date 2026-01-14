"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import ImageUploader from "@/app/components/admin/ui/ImageUploader";
import CourseCard from "@/app/components/admin/lms/CourseCard";
import styles from "@/app/styles/lms.module.css";
import { API_BASE } from "@/lib/config";
import { IconBack, IconPlus } from "@/app/components/ui/Icons";

interface EditarTemaPageProps {
    params: Promise<{ id: string }>;
}

interface Course {
    id: string;
    title: string;
    description: string;
    published: boolean;
    isFree: boolean;
    order: number;
    _count?: { lessons: number };
}

interface Theme {
    id: string;
    title: string;
    description: string;
    coverImage: string | null;
    order: number;
    published: boolean;
    courses: Course[];
    evaluation: { id: string; title: string } | null;
}

export default function EditarTemaPage({ params }: EditarTemaPageProps) {
    const { isAdmin, loading: authLoading } = useAuth();
    const router = useRouter();

    const [themeId, setThemeId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        coverImage: null as string | null,
        order: 0,
        published: false,
    });
    const [courses, setCourses] = useState<Course[]>([]);
    const [evaluation, setEvaluation] = useState<{ id: string; title: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        params.then((p) => setThemeId(p.id));
    }, [params]);

    useEffect(() => {
        if (themeId && isAdmin) {
            fetchTheme();
        }
    }, [themeId, isAdmin]);

    const fetchTheme = async () => {
        try {
            const res = await fetch(`${API_BASE}/admin/lms/themes/${themeId}`, {
                credentials: "include",
            });

            if (!res.ok) throw new Error("Tema no encontrado");

            const data: Theme = await res.json();
            setFormData({
                title: data.title,
                description: data.description,
                coverImage: data.coverImage,
                order: data.order,
                published: data.published,
            });
            setCourses(data.courses || []);
            setEvaluation(data.evaluation);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al cargar tema");
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
            const res = await fetch(`${API_BASE}/admin/lms/themes/${themeId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Error al guardar");
            }

            router.push("/admin/cursos");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error desconocido");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteCourse = async (courseId: string) => {
        if (!confirm("¿Eliminar este curso y todas sus lecciones?")) return;

        try {
            const res = await fetch(`${API_BASE}/admin/lms/courses/${courseId}`, {
                method: "DELETE",
                credentials: "include",
            });

            if (!res.ok) throw new Error("Error al eliminar curso");

            setCourses((prev) => prev.filter((c) => c.id !== courseId));
        } catch (err) {
            alert(err instanceof Error ? err.message : "Error al eliminar");
        }
    };

    const handleCreateEvaluation = async () => {
        if (!confirm("¿Crear una evaluación para este tema?")) return;
        try {
            const res = await fetch(`${API_BASE}/admin/lms/evaluations`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    themeId,
                    title: `Evaluación de ${formData.title}`,
                    passingScore: 70
                }),
            });

            if (!res.ok) throw new Error("Error al crear evaluación");
            const newEval = await res.json();
            setEvaluation(newEval);
            router.push(`/admin/cursos/temas/${themeId}/evaluacion/${newEval.id}`);
        } catch (err) {
            alert("Error al crear la evaluación");
        }
    };

    return (
        <div className={styles.formPage}>
            <Link href="/admin/cursos" className={styles.backLink}>
                <IconBack size={16} />
                Volver a Temas
            </Link>

            <div className={styles.formCard}>
                <h1 className={styles.formTitle}>Editar Tema</h1>

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
                            folder="lms-themes"
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
                        <Link href="/admin/cursos" className={styles.cancelBtn}>
                            Cancelar
                        </Link>
                        <button type="submit" className={styles.submitBtn} disabled={saving}>
                            {saving ? "Guardando..." : "Guardar Cambios"}
                        </button>
                    </div>
                </form>
            </div>

            {/* Lista de Cursos del Tema */}
            <div className={styles.formCard} style={{ marginTop: "2rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                    <h2 className={styles.formTitle} style={{ marginBottom: 0 }}>Cursos del Tema</h2>
                    <Link href={`/admin/cursos/temas/${themeId}/cursos/nuevo`} className={styles.addBtn}>
                        <IconPlus size={16} />
                        Agregar Curso
                    </Link>
                </div>

                {courses.length === 0 ? (
                    <p style={{ color: "var(--foreground-muted)", textAlign: "center", padding: "2rem 0" }}>
                        No hay cursos en este tema. Agrega el primero.
                    </p>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {courses.map((course) => (
                            <CourseCard
                                key={course.id}
                                course={course}
                                themeId={themeId!}
                                onDelete={handleDeleteCourse}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Sección de Evaluación */}
            <div className={styles.formCard} style={{ marginTop: "2rem" }}>
                <h2 className={styles.formTitle}>Evaluación del Tema</h2>
                {evaluation ? (
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "1rem",
                        background: "var(--background)",
                        border: "1px solid var(--border)",
                        borderRadius: "0.5rem"
                    }}>
                        <div>
                            <p style={{ fontWeight: 600, margin: 0 }}>{evaluation.title}</p>
                            <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--foreground-muted)" }}>
                                examen activo para este tema
                            </p>
                        </div>
                        <Link
                            href={`/admin/cursos/temas/${themeId}/evaluacion/${evaluation.id}`}
                            className={styles.submitBtn}
                            style={{ textDecoration: "none" }}
                        >
                            Gestionar Preguntas
                        </Link>
                    </div>
                ) : (
                    <div style={{ textAlign: "center", padding: "1rem" }}>
                        <p style={{ color: "var(--foreground-muted)", marginBottom: "1rem" }}>
                            Este tema no tiene evaluación asignada.
                        </p>
                        <button
                            onClick={handleCreateEvaluation}
                            className={styles.outlineBtn}
                        >
                            Crear Evaluación
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
