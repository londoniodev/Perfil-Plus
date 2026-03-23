"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { API_BASE, TENANT_ID } from "@/lib/config";
import QuestionEditor from "@/components/admin/lms/QuestionEditor";
import { IconEdit, IconDocument, IconCheck, IconTrash, IconPlus, IconBack } from "@alvarosky/ui";
import { useToast } from "@alvarosky/ui";
import { Button } from "@alvarosky/ui";
import { Input } from "@alvarosky/ui";
import { Textarea } from "@alvarosky/ui";
import { Label } from "@alvarosky/ui";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@alvarosky/ui";
import { Badge } from "@alvarosky/ui";

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
    const toast = useToast();
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
                headers: {},
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
            toast.error("Error al cargar datos de la evaluación");
            router.push(`/academia/cursos/temas/${params.id}`);
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
                headers: { "Content-Type": "application/json"},
                credentials: "include",
                body: JSON.stringify(basicInfo),
            });

            if (!res.ok) throw new Error("Error al actualizar");
            toast.success("Información actualizada correctamente");
        } catch (err) {
            toast.error("Error al guardar cambios");
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
                    headers: { "Content-Type": "application/json"},
                    credentials: "include",
                    body: JSON.stringify(q),
                });
                if (!res.ok) throw new Error("Error al actualizar pregunta");
            } else {
                // Create new
                const res = await fetch(`${API_BASE}/admin/lms/evaluations/${params.evaluationId}/questions`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json"},
                    credentials: "include",
                    body: JSON.stringify(q),
                });
                if (!res.ok) throw new Error("Error al crear pregunta");
            }

            setEditingQuestion(null);
            setIsCreatingQuestion(false);
            fetchEvaluation();
            toast.success("Pregunta guardada correctamente");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Error al guardar pregunta");
        }
    };

    const handleDeleteQuestion = async (id: string) => {
        if (!confirm("¿Eliminar esta pregunta?")) return;
        try {
            const res = await fetch(`${API_BASE}/admin/lms/questions/${id}`, {
                method: "DELETE",
                headers: {},
                credentials: "include"
            });
            if (!res.ok) throw new Error("Error al eliminar");
            fetchEvaluation();
            toast.success("Pregunta eliminada correctamente");
        } catch (err) {
            toast.error("Error al eliminar pregunta");
        }
    };

    if (loading) return <div className="p-8 text-center text-muted-foreground">Cargando...</div>;
    if (!evaluation) return null;

    return (
        <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
            <Link href={`/academia/cursos/temas/${params.id}`} className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <IconBack size={16} />
                Volver al Tema
            </Link>

            {/* Configuración Básica */}
            <Card className="border-border">
                <CardHeader>
                    <CardTitle className="text-2xl">Gestionar Evaluación</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleUpdateBasicInfo} className="space-y-6">
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <IconEdit size={18} />
                                Título del Examen
                            </Label>
                            <Input
                                type="text"
                                value={basicInfo.title}
                                onChange={(e) => setBasicInfo({ ...basicInfo, title: e.target.value })}
                                className="text-lg font-medium"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <IconDocument size={18} />
                                Descripción / Instrucciones
                            </Label>
                            <Textarea
                                value={basicInfo.description}
                                onChange={(e) => setBasicInfo({ ...basicInfo, description: e.target.value })}
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <IconCheck size={18} />
                                Puntaje para aprobar (%)
                            </Label>
                            <Input
                                type="number"
                                value={basicInfo.passingScore}
                                onChange={(e) => setBasicInfo({ ...basicInfo, passingScore: Number(e.target.value) })}
                                min="0"
                                max="100"
                            />
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={saving}>
                                {saving ? "Guardando..." : "Guardar Configuración"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Lista de Preguntas */}
            <Card className="border-border">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Preguntas ({evaluation.questions.length})</CardTitle>
                    <Button
                        onClick={() => {
                            setEditingQuestion(null);
                            setIsCreatingQuestion(true);
                        }}
                        disabled={isCreatingQuestion || !!editingQuestion}
                        className="gap-2"
                        size="sm"
                    >
                        <IconPlus size={16} />
                        Nueva Pregunta
                    </Button>
                </CardHeader>
                <CardContent>
                    {/* Editor Activo */}
                    {(isCreatingQuestion || editingQuestion) && (
                        <div className="mb-6 p-4 border rounded-lg bg-muted/10">
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
                        </div>
                    )}

                    {/* Listado */}
                    {!isCreatingQuestion && !editingQuestion && (
                        <div className="flex flex-col gap-3">
                            {evaluation.questions.length > 0 ? (
                                evaluation.questions.map((q, index) => (
                                    <div key={q.id} className="flex items-start gap-4 p-4 border rounded-lg hover:border-primary/50 transition-colors bg-card">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold shrink-0">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium mb-1 truncate">{q.question}</p>
                                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                {q.image && <Badge variant="outline" className="text-xs">📷 Con imagen</Badge>}
                                                <span>{q.options.length} opciones</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setEditingQuestion(q)}
                                                className="h-8 w-8 p-0"
                                            >
                                                <IconEdit size={16} />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteQuestion(q.id!)}
                                                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                            >
                                                <IconTrash size={16} />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg bg-muted/20">
                                    No hay preguntas en esta evaluación.
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
