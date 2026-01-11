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

type QuestionType = "single" | "true_false";

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

    // Determine initial type based on options
    const detectType = (): QuestionType => {
        if (initialQuestion.options?.length === 2 &&
            initialQuestion.options.some(o => o.text === "Verdadero") &&
            initialQuestion.options.some(o => o.text === "Falso")) {
            return "true_false";
        }
        return "single";
    };

    const [type, setType] = useState<QuestionType>(detectType());

    // Handle Type Change
    const handleTypeChange = (newType: QuestionType) => {
        setType(newType);
        if (newType === "true_false") {
            setOptions([
                { id: "true", text: "Verdadero" },
                { id: "false", text: "Falso" }
            ]);
            setCorrectId(""); // Reset correct answer
        } else {
            // Reset to default blank options for single choice
            setOptions([{ id: "1", text: "" }, { id: "2", text: "" }]);
            setCorrectId("");
        }
    };

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
        <div className={styles.formCard} style={{ marginTop: "1rem" }}>
            <h3 className={styles.formTitle} style={{ marginBottom: "1.5rem", fontSize: "1.25rem" }}>
                {initialQuestion.id ? "Editar Pregunta" : "Nueva Pregunta"}
            </h3>

            {error && (
                <div className={styles.error}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: "0.5rem", verticalAlign: "middle" }}>
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {/* Question Type Selector */}
                <div className={styles.formGroup}>
                    <label className={styles.formLabel} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                        </svg>
                        Tipo de Pregunta
                    </label>
                    <div style={{ display: "flex", gap: "1rem" }}>
                        <button
                            type="button"
                            onClick={() => handleTypeChange("single")}
                            className={`${styles.selectionCard} ${type === "single" ? styles.active : ""}`}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <circle cx="12" cy="12" r="4" />
                            </svg>
                            <span style={{ fontWeight: 600 }}>Opción Múltiple</span>
                            <span style={{ fontSize: "0.75rem", opacity: 0.8 }}>Una respuesta correcta</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleTypeChange("true_false")}
                            className={`${styles.selectionCard} ${type === "true_false" ? styles.active : ""}`}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                            </svg>
                            <span style={{ fontWeight: 600 }}>Verdadero / Falso</span>
                            <span style={{ fontSize: "0.75rem", opacity: 0.8 }}>Elección binaria</span>
                        </button>
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.formLabel} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        Enunciado de la pregunta
                    </label>
                    <textarea
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        className={`${styles.formInput} ${styles.formTextarea}`}
                        rows={3}
                        placeholder="Escribe tu pregunta aquí..."
                        autoFocus
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.formLabel} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                        </svg>
                        Imagen de referencia (Opcional)
                    </label>
                    <ImageUploader
                        value={image || null}
                        onChange={(url) => setImage(url || "")}
                        folder="lms-questions"
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.formLabel} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <ul style={{ margin: 0, paddingLeft: "1.2rem" }}>
                                <li style={{ listStyle: "none" }}><path d="M9 11l3 3L22 4" /></li>
                                <li style={{ listStyle: "none" }}><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></li>
                            </ul>
                            <path d="M9 11l3 3L22 4" />
                            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                        </svg>
                        Opciones de respuesta <span className={styles.toggleHint}>(Marca la correcta)</span>
                    </label>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {options.map((option, index) => (
                            <div
                                key={option.id}
                                className={`${styles.optionRow} ${correctId === option.id ? styles.correct : ""}`}
                            >
                                <div
                                    onClick={() => setCorrectId(option.id)}
                                    className={styles.optionRadio}
                                >
                                    {correctId === option.id && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><polyline points="20 6 9 17 4 12" /></svg>}
                                </div>
                                <input
                                    type="text"
                                    value={option.text}
                                    onChange={(e) => handleOptionChange(option.id, e.target.value)}
                                    className={styles.formInput}
                                    placeholder={type === "true_false" ? option.text : `Opción ${index + 1}`}
                                    readOnly={type === "true_false"}
                                    style={{
                                        border: "none",
                                        background: "transparent",
                                        padding: 0,
                                        cursor: type === "true_false" ? "default" : "text",
                                        boxShadow: "none"
                                    }}
                                />
                                {type !== "true_false" && (
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveOption(option.id)}
                                        className={styles.actionBtn}
                                        style={{ color: "#ef4444" }}
                                        title="Eliminar opción"
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M18 6L6 18M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {type === "single" && (
                        <button
                            type="button"
                            onClick={handleAddOption}
                            className={styles.outlineBtn}
                            style={{ marginTop: "1rem" }}
                        >
                            + Agregar Opción
                        </button>
                    )}
                </div>

                <div className={styles.formActions}>
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
