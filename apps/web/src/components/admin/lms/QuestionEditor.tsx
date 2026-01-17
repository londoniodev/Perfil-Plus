"use client";

import { useState } from "react";
import ImageUploader from "@/components/admin/ui/ImageUploader";
import { useToast } from "@mauromera/ui";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@mauromera/ui";
import { Label } from "@mauromera/ui";
import { Input } from "@mauromera/ui";
import { Button } from "@mauromera/ui";
import { Textarea } from "@mauromera/ui";

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
    const toast = useToast();

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
            toast.error("Mínimo 2 opciones requeridas");
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
            toast.error("La pregunta es requerida");
            return;
        }
        if (options.some(o => !o.text.trim())) {
            toast.error("Todas las opciones deben tener texto");
            return;
        }
        if (!correctId) {
            toast.error("Debes seleccionar una respuesta correcta");
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
        <Card className="mt-4">
            <CardHeader>
                <CardTitle className="text-xl">
                    {initialQuestion.id ? "Editar Pregunta" : "Nueva Pregunta"}
                </CardTitle>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Question Type Selector */}
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                            </svg>
                            Tipo de Pregunta
                        </Label>
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => handleTypeChange("single")}
                                className={`flex-1 p-4 border rounded-lg cursor-pointer transition-all flex flex-col items-center gap-2 text-center hover:border-primary hover:text-primary hover:bg-card ${type === "single" ? "bg-primary/10 border-primary text-primary" : "bg-background text-muted-foreground"}`}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10" />
                                    <circle cx="12" cy="12" r="4" />
                                </svg>
                                <span className="font-semibold">Opción Múltiple</span>
                                <span className="text-xs opacity-80">Una respuesta correcta</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => handleTypeChange("true_false")}
                                className={`flex-1 p-4 border rounded-lg cursor-pointer transition-all flex flex-col items-center gap-2 text-center hover:border-primary hover:text-primary hover:bg-card ${type === "true_false" ? "bg-primary/10 border-primary text-primary" : "bg-background text-muted-foreground"}`}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                                </svg>
                                <span className="font-semibold">Verdadero / Falso</span>
                                <span className="text-xs opacity-80">Elección binaria</span>
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                            Enunciado de la pregunta
                        </Label>
                        <Textarea
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            rows={3}
                            placeholder="Escribe tu pregunta aquí..."
                            autoFocus
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                <circle cx="8.5" cy="8.5" r="1.5" />
                                <polyline points="21 15 16 10 5 21" />
                            </svg>
                            Imagen de referencia (Opcional)
                        </Label>
                        <ImageUploader
                            value={image || null}
                            onChange={(url) => setImage(url || "")}
                            folder="lms-questions"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <ul className="m-0 pl-5">
                                    <li className="list-none"><path d="M9 11l3 3L22 4" /></li>
                                    <li className="list-none"><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></li>
                                </ul>
                                <path d="M9 11l3 3L22 4" />
                                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                            </svg>
                            Opciones de respuesta <span className="text-muted-foreground text-xs font-normal ml-2">(Marca la correcta)</span>
                        </Label>
                        <div className="flex flex-col gap-3">
                            {options.map((option, index) => (
                                <div
                                    key={option.id}
                                    className={`flex items-center gap-3 p-3 bg-background border rounded-lg transition-all ${correctId === option.id ? "bg-green-500/10 border-green-500" : "border-border"}`}
                                >
                                    <div
                                        onClick={() => setCorrectId(option.id)}
                                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer flex-shrink-0 transition-colors ${correctId === option.id ? "border-green-500 bg-green-500" : "border-muted-foreground bg-transparent"}`}
                                    >
                                        {correctId === option.id && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><polyline points="20 6 9 17 4 12" /></svg>}
                                    </div>
                                    <input
                                        type="text"
                                        value={option.text}
                                        onChange={(e) => handleOptionChange(option.id, e.target.value)}
                                        className="w-full bg-transparent border-none p-0 focus:ring-0 focus:outline-none placeholder:text-muted-foreground/50"
                                        placeholder={type === "true_false" ? option.text : `Opción ${index + 1}`}
                                        readOnly={type === "true_false"}
                                        style={{
                                            cursor: type === "true_false" ? "default" : "text",
                                        }}
                                    />
                                    {type !== "true_false" && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemoveOption(option.id)}
                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                            title="Eliminar opción"
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M18 6L6 18M6 6l12 12" />
                                            </svg>
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {type === "single" && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleAddOption}
                                className="w-full mt-4 border-dashed"
                            >
                                + Agregar Opción
                            </Button>
                        )}
                    </div>

                    <div className="flex justify-end gap-4 pt-4 border-t border-border">
                        <Button type="button" variant="outline" onClick={onCancel}>
                            Cancelar
                        </Button>
                        <Button type="submit">
                            Guardar Pregunta
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
