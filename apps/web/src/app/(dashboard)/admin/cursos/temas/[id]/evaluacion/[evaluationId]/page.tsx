"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { API_BASE } from "@/lib/config";
import QuestionEditor from "@/app/components/admin/lms/QuestionEditor";
import styles from "@/app/(dashboard)/admin/cursos/lms.module.css";

interface Option {
    id: string;
    text: string;
}

interface Question {
    id?: string;
    question: string;
    image?: string;
    options: Option[];
    correctId: string;
    order: number;
}

interface Evaluation {
    id: string;
    title: string;
    description: string;
    passingScore: number;
    questions: Question[];
}

export default function EditarEvaluacionPage() {
    const params = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
    const [isCreatingQuestion, setIsCreatingQuestion] = useState(false);

    // Form fields for basic info
    const [basicInfo, setBasicInfo] = useState({
        title: "",
        description: "",
        passingScore: 70
    });

    const fetchEvaluation = async () => {
        try {
            const res = await fetch(`${API_BASE}/admin/lms/evaluations/${params.evaluationId}`, {
                credentials: "include",
            });
            if (!res.ok) throw new Error("Error al cargar evaluación");
            const data = await res.json();
            setEvaluation(data);
            setBasicInfo({
                title: data.title,
                description: data.description || "",
                passingScore: data.passingScore
            });
        } catch (err) {
            alert("Error al cargar datos");
            router.push(`/admin/cursos/temas/${params.id}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvaluation();
    }, [params.evaluationId]);

    const handleUpdateBasicInfo = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch(`${API_BASE}/admin/lms/evaluations/${params.evaluationId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(basicInfo),
            });
            if (!res.ok) throw new Error("Error al actualizar");
            alert("Información actualizada");
        } catch (err) {
            alert("Error al guardar cambios");
        } finally {
            setSaving(false);
        }
    };

    const handleSaveQuestion = async (q: Question) => {
        try {
            if (q.id) {
                // Update existing
                const res = await fetch(`${API_BASE}/admin/lms/questions/${q.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify(q),
                });
                if (!res.ok) throw new Error("Error al actualizar pregunta");
            } else {
                // Create new
                const res = await fetch(`${API_BASE}/admin/lms/evaluations/${params.evaluationId}/questions`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify(q),
                });
                if (!res.ok) throw new Error("Error al crear pregunta");
            }

            setEditingQuestion(null);
            setIsCreatingQuestion(false);
            fetchEvaluation();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Error al guardar pregunta");
        }
    };

    const handleDeleteQuestion = async (id: string) => {
        if (!confirm("¿Eliminar esta pregunta?")) return;
        try {
            const res = await fetch(`${API_BASE}/admin/lms/questions/${id}`, {
                method: "DELETE",
                credentials: "include"
            });
            if (!res.ok) throw new Error("Error al eliminar");
            fetchEvaluation();
        } catch (err) {
            alert("Error al eliminar pregunta");
        }
    };

    if (loading) return <div className={styles.loading}>Cargando...</div>;
    if (!evaluation) return null;

    return (
        <div className={styles.formPage}>
            <Link href={`/admin/cursos/temas/${params.id}`} className={styles.backLink}>
                ← Volver al Tema
            </Link>

            <h1 className={styles.pageTitle}>Gestionar Evaluación</h1>

            {/* Configuración Básica */}
            <div className={styles.formCard}>
                <h2 className={styles.formTitle}>Configuración General</h2>
                <form onSubmit={handleUpdateBasicInfo}>
                    <div className={styles.formGroup}>
                        <label>Título del Examen</label>
                        <input
                            type="text"
                            value={basicInfo.title}
                            onChange={(e) => setBasicInfo({ ...basicInfo, title: e.target.value })}
                            className={styles.input}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Descripción / Instrucciones</label>
                        <textarea
                            value={basicInfo.description}
                            onChange={(e) => setBasicInfo({ ...basicInfo, description: e.target.value })}
                            className={styles.input}
                            rows={3}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Puntaje para aprobar (%)</label>
                        <input
                            type="number"
                            value={basicInfo.passingScore}
                            onChange={(e) => setBasicInfo({ ...basicInfo, passingScore: Number(e.target.value) })}
                            className={styles.input}
                            min="0"
                            max="100"
                        />
                    </div>
                    <div className={styles.actions}>
                        <button type="submit" className={styles.submitBtn} disabled={saving}>
                            {saving ? "Guardando..." : "Guardar Configuración"}
                        </button>
                    </div>
                </form>
            </div>

            {/* Lista de Preguntas */}
            <div className={styles.formCard} style={{ marginTop: "2rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                    <h2 className={styles.formTitle} style={{ marginBottom: 0 }}>Preguntas ({evaluation.questions.length})</h2>
                    <button
                        onClick={() => {
                            setEditingQuestion(null);
                            setIsCreatingQuestion(true);
                        }}
                        className={styles.addBtn}
                        disabled={isCreatingQuestion || !!editingQuestion}
                    >
                        + Nueva Pregunta
                    </button>
                </div>

                {/* Editor Activo */}
                {(isCreatingQuestion || editingQuestion) && (
                    <QuestionEditor
                        question={editingQuestion || {
                            question: "",
                            options: [],
                            correctId: "",
                            order: evaluation.questions.length + 1
                        }}
                        onSave={handleSaveQuestion}
                        onCancel={() => {
                            setEditingQuestion(null);
                            setIsCreatingQuestion(false);
                        }}
                    />
                )}

                {/* Listado */}
                {!isCreatingQuestion && !editingQuestion && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {evaluation.questions.map((q, index) => (
                            <div key={q.id} style={{
                                padding: "1rem",
                                background: "var(--background)",
                                border: "1px solid var(--border)",
                                borderRadius: "0.5rem",
                                display: "flex",
                                gap: "1rem"
                            }}>
                                <div style={{
                                    width: "2rem",
                                    height: "2rem",
                                    background: "var(--accent)",
                                    color: "white",
                                    borderRadius: "50%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontWeight: "bold",
                                    flexShrink: 0
                                }}>
                                    {index + 1}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ margin: "0 0 0.5rem 0", fontWeight: 500 }}>{q.question}</p>
                                    <div style={{ fontSize: "0.875rem", color: "var(--foreground-muted)" }}>
                                        {q.image && <span style={{ marginRight: "1rem" }}>📷 Con imagen</span>}
                                        <span>{q.options.length} opciones</span>
                                    </div>
                                </div>
                                <div className={styles.themeActions}>
                                    <button
                                        onClick={() => setEditingQuestion(q)}
                                        className={styles.actionBtn}
                                        title="Editar"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => handleDeleteQuestion(q.id!)}
                                        className={`${styles.actionBtn} ${styles.danger}`}
                                        title="Eliminar"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
