"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import ImageUploader from "@/app/components/admin/ImageUploader";
import styles from "../../../../lms.module.css";
import { API_BASE } from "@/lib/config";

interface NuevoCursoPageProps {
    params: Promise<{ id: string }>;
}

export default function NuevoCursoPage({ params }: NuevoCursoPageProps) {
    const { isAdmin, loading: authLoading } = useAuth();
    const router = useRouter();

    const [themeId, setThemeId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        coverImage: null as string | null,
        order: 0,
        isFree: false,
        published: false,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        params.then((p) => setThemeId(p.id));
    }, [params]);

    if (authLoading) {
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

        if (!formData.description.trim()) {
            setError("La descripción es requerida");
            return;
        }

        setError(null);
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE}/admin/lms/courses`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    ...formData,
                    themeId,
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Error al crear curso");
            }

            router.push(`/admin/cursos/temas/${themeId}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error desconocido");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.formPage}>
            <Link href={`/admin/cursos/temas/${themeId}`} className={styles.backLink}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Volver al Tema
            </Link>

            <div className={styles.formCard}>
                <h1 className={styles.formTitle}>Nuevo Curso</h1>

                {error && <div className={styles.error}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Título *</label>
                        <input
                            type="text"
                            className={styles.formInput}
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Ej: Introducción a React"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Descripción *</label>
                        <textarea
                            className={`${styles.formInput} ${styles.formTextarea}`}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="¿Qué aprenderán los estudiantes en este curso?"
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
                        <Link href={`/admin/cursos/temas/${themeId}`} className={styles.cancelBtn}>
                            Cancelar
                        </Link>
                        <button type="submit" className={styles.submitBtn} disabled={loading}>
                            {loading ? "Guardando..." : "Crear Curso"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
