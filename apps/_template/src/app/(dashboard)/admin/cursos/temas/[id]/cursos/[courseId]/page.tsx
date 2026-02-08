"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { ImageUploader } from "@alvarosky/ui";
import { API_BASE, TENANT_ID } from "@/lib/config";
import { LessonItem } from "@alvarosky/ui";
import { IconBack, IconPlus } from "@alvarosky/ui";
import { useToast } from "@alvarosky/ui";
import { Button } from "@alvarosky/ui";
import { Input } from "@alvarosky/ui";
import { Textarea } from "@alvarosky/ui";
import { Label } from "@alvarosky/ui";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@alvarosky/ui";
import { Switch } from "@alvarosky/ui";

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
    const toast = useToast();

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
                headers: { 'x-tenant-id': TENANT_ID },
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
            toast.error(err instanceof Error ? err.message : "Error al cargar curso");
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
            const res = await fetch(`${API_BASE}/admin/lms/courses/${ids!.courseId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", "x-tenant-id": TENANT_ID },
                credentials: "include",
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Error al guardar");
            }

            router.push(`/admin/cursos/temas/${ids!.id}`);
            toast.success("Curso actualizado correctamente");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Error desconocido");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteLesson = async (lessonId: string) => {
        if (!confirm("¿Eliminar lección?")) return;

        try {
            const res = await fetch(`${API_BASE}/admin/lms/lessons/${lessonId}`, {
                method: "DELETE",
                headers: { 'x-tenant-id': TENANT_ID },
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
            toast.success("Lección eliminada correctamente");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Error al eliminar");
        }
    };

    return (
        <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
            <Link href={`/admin/cursos/temas/${ids!.id}`} className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <IconBack size={16} />
                Volver al Tema: {course?.theme.title}
            </Link>

            <Card className="border-border">
                <CardHeader>
                    <CardTitle className="text-2xl">Editar Curso</CardTitle>
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
                                apiBase={API_BASE}
                                tenantId={TENANT_ID}
                                value={formData.coverImage}
                                onChange={(url) => setFormData({ ...formData, coverImage: url })}
                                folder="lms-courses"
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
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-center justify-between w-full p-3 bg-muted/30 rounded-lg border">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Curso Gratuito</Label>
                                    <p className="text-xs text-muted-foreground">Disponible para todos los usuarios</p>
                                </div>
                                <Switch
                                    checked={formData.isFree}
                                    onCheckedChange={(checked) => setFormData({ ...formData, isFree: checked })}
                                />
                            </div>

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

                        <div className="flex justify-end gap-3 pt-6 border-t">
                            <Button variant="outline" asChild>
                                <Link href={`/admin/cursos/temas/${ids!.id}`}>Cancelar</Link>
                            </Button>
                            <Button type="submit" disabled={saving}>
                                {saving ? "Guardando..." : "Guardar Cambios"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Lista de Lecciones */}
            <Card className="border-border">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Lecciones</CardTitle>
                    <Button asChild size="sm" className="gap-2">
                        <Link href={`/admin/cursos/temas/${ids!.id}/cursos/${ids!.courseId}/lecciones/nuevo`}>
                            <IconPlus size={16} />
                            Agregar Lección
                        </Link>
                    </Button>
                </CardHeader>

                <CardContent>
                    {course?.lessons && course.lessons.length > 0 ? (
                        <div className="flex flex-col gap-2">
                            {course.lessons.map((lesson) => (
                                <LessonItem
                                    key={lesson.id}
                                    lesson={lesson}
                                    onEdit={(id) => router.push(`/admin/cursos/temas/${ids!.id}/cursos/${ids!.courseId}/lecciones/${id}`)}
                                    onDelete={handleDeleteLesson}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg bg-muted/20">
                            No hay lecciones en este curso.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
