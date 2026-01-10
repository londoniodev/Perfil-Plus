"use client";

import { useState, useEffect } from "react";
import ImageUploader from "../ImageUploader";
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

interface QuestionEditorProps {
    question: Question;
    onSave: (q: Question) => void;
    onCancel: () => void;
}

export default function QuestionEditor({ question: initialQuestion, onSave, onCancel }: QuestionEditorProps) {
    const [question, setQuestion] = useState(initialQuestion.question || "");
    const [image, setImage] = useState(initialQuestion.image || "");
    const [options, setOptions] = useState<Option[]>(
        initialQuestion.options?.length > 0
            ? initialQuestion.options
            : [{ id: "1", text: "" }, { id: "2", text: "" }]
    );
    const [correctId, setCorrectId] = useState(initialQuestion.correctId || "");
    const [error, setError] = useState<string | null>(null);

    const handleAddOption = () => {
        setOptions([...options, { id: Date.now().toString(), text: "" }]);
    };

    const handleRemoveOption = (id: string) => {
        if (options.length <= 2) {
            setError("Mínimo 2 opciones requeridas");
            return;
        }
        setOptions(options.filter(o => o.id !== id));
        if (correctId === id) setCorrectId("");
    };

    const handleOptionChange = (id: string, text: string) => {
        setOptions(options.map(o => o.id === id ? { ...o, text } : o));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!question.trim()) {
            setError("La pregunta es requerida");
            return;
        }
        if (options.some(o => !o.text.trim())) {
            setError("Todas las opciones deben tener texto");
            return;
        }
        if (!correctId) {
            setError("Debes seleccionar una respuesta correcta");
            return;
        }

        onSave({
            ...initialQuestion,
            question,
            image,
            options,
            correctId,
        });
    };

    return (
        <div style={{
            background: "var(--card-bg)",
            border: "1px solid var(--border)",
            borderRadius: "0.5rem",
            padding: "1.5rem",
            marginTop: "1rem"
        }}>
            <h3 style={{ marginTop: 0, marginBottom: "1rem" }}>
                {initialQuestion.id ? "Editar Pregunta" : "Nueva Pregunta"}
            </h3>

            {error && (
                <div style={{
                    color: "#ef4444",
                    background: "rgba(239, 68, 68, 0.1)",
                    padding: "0.5rem",
                    borderRadius: "0.25rem",
                    marginBottom: "1rem",
                    fontSize: "0.875rem"
                }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                    <label>Enunciado de la pregunta</label>
                    <textarea
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        className={styles.input}
                        rows={3}
                        placeholder="Escribe tu pregunta aquí..."
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>Imagen de referencia (Opcional)</label>
                    <ImageUploader
                        value={image || null}
                        onChange={(url) => setImage(url || "")}
                        folder="lms-questions"
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>Opciones de respuesta</label>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        {options.map((option, index) => (
                            <div key={option.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <input
                                    type="radio"
                                    name="correctAnswer"
                                    checked={correctId === option.id}
                                    onChange={() => setCorrectId(option.id)}
                                    style={{ width: "1.25rem", height: "1.25rem", cursor: "pointer" }}
                                    title="Marcar como correcta"
                                />
                                <input
                                    type="text"
                                    value={option.text}
                                    onChange={(e) => handleOptionChange(option.id, e.target.value)}
                                    className={styles.input}
                                    placeholder={`Opción ${index + 1}`}
                                    style={{ flex: 1 }}
                                />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveOption(option.id)}
                                    style={{
                                        background: "transparent",
                                        border: "none",
                                        color: "#ef4444",
                                        cursor: "pointer",
                                        padding: "0.25rem"
                                    }}
                                    title="Eliminar opción"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                    <button
                        type="button"
                        onClick={handleAddOption}
                        className={styles.outlineBtn}
                        style={{ marginTop: "0.5rem", width: "100%" }}
                    >
                        + Agregar Opción
                    </button>
                </div>

                <div className={styles.actions} style={{ justifyContent: "flex-end", marginTop: "1.5rem" }}>
                    <button type="button" onClick={onCancel} className={styles.cancelBtn}>
                        Cancelar
                    </button>
                    <button type="submit" className={styles.submitBtn}>
                        Guardar Pregunta
                    </button>
                </div>
            </form>
        </div>
    );
}
