"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import ImageUploader from "@/components/admin/ui/ImageUploader";
import CourseCard from "@/components/admin/lms/CourseCard";
import { API_BASE } from "@/lib/config";
import { IconBack, IconPlus } from "@/components/ui/Icons";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import { Switch } from "@/components/ui/switch";

interface EditarTemaPageProps {
    params: Promise<{ id: string }>;
}

import { Course, Theme } from "@/types/lms";

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
    const toast = useToast();

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
            setEvaluation(data.evaluation || null);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Error al cargar tema");
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || loading) {
        return <div className="p-8 text-center text-muted-foreground">Cargando...</div>;
    }

    if (!isAdmin) {
        router.push("/perfil");
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            toast.error("El título es requerido");
            return;
        }

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
            toast.success("Tema actualizado correctamente");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Error desconocido");
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
            toast.success("Curso eliminado correctamente");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Error al eliminar");
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
            toast.success("Evaluación creada");
        } catch (err) {
            toast.error("Error al crear la evaluación");
        }
    };

    return (
        <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
            <Link href="/admin/cursos" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <IconBack size={16} />
                Volver a Temas
            </Link>

            <Card className="border-border">
                <CardHeader>
                    <CardTitle className="text-2xl">Editar Tema</CardTitle>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Título *</Label>
                            <Input
                                id="title"
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Descripción *</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={4}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Imagen de portada</Label>
                            <ImageUploader
                                value={formData.coverImage}
                                onChange={(url) => setFormData({ ...formData, coverImage: url })}
                                folder="lms-themes"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="order">Orden</Label>
                                <Input
                                    id="order"
                                    type="number"
                                    value={formData.order}
                                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                                    min="0"
                                />
                            </div>

                            <div className="flex items-end h-full pb-2">
                                <div className="flex items-center justify-between w-full p-3 bg-muted/30 rounded-lg border">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Publicar</Label>
                                        <p className="text-xs text-muted-foreground">Hacer visible para usuarios</p>
                                    </div>
                                    <Switch
                                        checked={formData.published}
                                        onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-6 border-t">
                            <Button variant="outline" asChild>
                                <Link href="/admin/cursos">Cancelar</Link>
                            </Button>
                            <Button type="submit" disabled={saving}>
                                {saving ? "Guardando..." : "Guardar Cambios"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Lista de Cursos del Tema */}
            <Card className="border-border">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Cursos del Tema</CardTitle>
                    <Button asChild size="sm" className="gap-2">
                        <Link href={`/admin/cursos/temas/${themeId}/cursos/nuevo`}>
                            <IconPlus size={16} />
                            Agregar Curso
                        </Link>
                    </Button>
                </CardHeader>

                <CardContent>
                    {courses.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg bg-muted/20">
                            No hay cursos en este tema. Agrega el primero.
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
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
                </CardContent>
            </Card>

            {/* Sección de Evaluación */}
            <Card className="border-border">
                <CardHeader>
                    <CardTitle>Evaluación del Tema</CardTitle>
                </CardHeader>
                <CardContent>
                    {evaluation ? (
                        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
                            <div>
                                <p className="font-semibold">{evaluation.title}</p>
                                <p className="text-sm text-muted-foreground">
                                    Examen activo para este tema
                                </p>
                            </div>
                            <Button asChild>
                                <Link href={`/admin/cursos/temas/${themeId}/evaluacion/${evaluation.id}`}>
                                    Gestionar Preguntas
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="text-center py-6">
                            <p className="text-muted-foreground mb-4">
                                Este tema no tiene evaluación asignada.
                            </p>
                            <Button variant="outline" onClick={handleCreateEvaluation}>
                                Crear Evaluación
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
