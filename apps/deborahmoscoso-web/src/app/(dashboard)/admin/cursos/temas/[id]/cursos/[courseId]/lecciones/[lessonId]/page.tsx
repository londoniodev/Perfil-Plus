"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { API_BASE, TENANT_ID } from "@/lib/config";
import { BlogEditor } from "@alvarosky/ui";
import { VideoUploader, LessonAttachmentManager } from "@alvarosky/ui";
import { useToast } from "@alvarosky/ui";
import { IconVideo, IconUpload, IconPlay, IconClock, IconList, IconDocument, IconBack } from "@alvarosky/ui";
import { Button } from "@alvarosky/ui";
import { Input } from "@alvarosky/ui";
import { Label } from "@alvarosky/ui";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@alvarosky/ui";
import { Switch } from "@alvarosky/ui";
import { Badge } from "@alvarosky/ui";

export default function EditarLeccionPage() {
    const params = useParams();
    const router = useRouter();
    const toast = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form state
    const [lesson, setLesson] = useState<any>(null);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [videoUrl, setVideoUrl] = useState("");
    const [videoType, setVideoType] = useState<"upload" | "youtube">("upload");
    const [duration, setDuration] = useState(0);
    const [order, setOrder] = useState(0);
    const [published, setPublished] = useState(false);

    // Fetch lesson data
    const fetchLesson = async () => {
        try {
            const res = await fetch(`${API_BASE}/admin/lms/lessons/${params.lessonId}`, {
                headers: { 'x-tenant-id': TENANT_ID },
                credentials: "include",
            });

            if (!res.ok) throw new Error("Error al cargar lección");

            const data = await res.json();
            setLesson(data);
            setTitle(data.title);
            setContent(data.content);
            setVideoUrl(data.videoUrl || "");

            // Determine video type
            if (data.videoUrl && (data.videoUrl.includes("youtube") || data.videoUrl.includes("youtu.be"))) {
                setVideoType("youtube");
            } else {
                setVideoType("upload");
            }

            setDuration(data.duration || 0);
            setOrder(data.order || 0);
            setPublished(data.published);
        } catch (err) {
            toast.error("Error al cargar datos de la lección");
            router.push(`/admin/cursos/temas/${params.id}/cursos/${params.courseId}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLesson();
    }, [params.lessonId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch(`${API_BASE}/admin/lms/lessons/${params.lessonId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", "x-tenant-id": TENANT_ID },
                credentials: "include",
                body: JSON.stringify({
                    title,
                    content,
                    videoUrl,
                    duration: Number(duration),
                    order: Number(order),
                    published,
                }),
            });

            if (!res.ok) throw new Error("Error al actualizar lección");

            toast.success("Lección actualizada correctamente");
            router.push(`/admin/cursos/temas/${params.id}/cursos/${params.courseId}`);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Error al guardar");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-muted-foreground">Cargando...</div>;

    return (
        <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
            <Link href={`/admin/cursos/temas/${params.id}/cursos/${params.courseId}`} className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <IconBack size={16} />
                Volver al curso
            </Link>

            <Card className="border-border">
                <CardHeader>
                    <CardTitle className="text-2xl flex items-center justify-between">
                        Editar Lección
                        {published ? (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Publicado</Badge>
                        ) : (
                            <Badge variant="secondary">Borrador</Badge>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-2">
                            <Label htmlFor="title">Título</Label>
                            <Input
                                id="title"
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                placeholder="Escribe un título claro para la lección"
                            />
                        </div>

                        <div className="space-y-4">
                            <Label className="flex items-center gap-2">
                                <IconVideo size={18} />
                                Video de la lección
                            </Label>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => { setVideoType("upload"); setVideoUrl(""); }}
                                    className={`flex items-center justify-center gap-2 p-4 border rounded-lg transition-all ${videoType === "upload"
                                        ? "bg-primary/10 border-primary text-primary"
                                        : "bg-background hover:bg-muted"
                                        }`}
                                >
                                    <IconUpload size={24} />
                                    <span className="font-semibold">Subir Video</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setVideoType("youtube"); setVideoUrl(""); }}
                                    className={`flex items-center justify-center gap-2 p-4 border rounded-lg transition-all ${videoType === "youtube"
                                        ? "bg-primary/10 border-primary text-primary"
                                        : "bg-background hover:bg-muted"
                                        }`}
                                >
                                    <IconPlay size={24} />
                                    <span className="font-semibold">YouTube</span>
                                </button>
                            </div>

                            {videoType === "upload" ? (
                                <VideoUploader
                                    apiBase={API_BASE}
                                    tenantId={TENANT_ID}
                                    value={videoUrl}
                                    onChange={(url) => setVideoUrl(url || "")}
                                    folder="lms-videos"
                                />
                            ) : (
                                <Input
                                    type="text"
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    value={videoUrl}
                                    onChange={(e) => setVideoUrl(e.target.value)}
                                />
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <IconClock size={18} />
                                    Duración (minutos)
                                </Label>
                                <Input
                                    type="number"
                                    value={duration}
                                    onChange={(e) => setDuration(Number(e.target.value))}
                                    min="0"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <IconList size={18} />
                                    Orden
                                </Label>
                                <Input
                                    type="number"
                                    value={order}
                                    onChange={(e) => setOrder(Number(e.target.value))}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <IconDocument size={18} />
                                Contenido / Descripción
                            </Label>
                            <div className="prose-admin">
                                <BlogEditor
                                    value={content}
                                    onChange={setContent}
                                    placeholder="Escribe el contenido de la lección aquí..."
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <LessonAttachmentManager
                                lessonId={lesson.id}
                                attachments={lesson.attachments}
                                onUpdate={fetchLesson}
                                apiBase={API_BASE}
                                tenantId={TENANT_ID}
                            />
                        </div>

                        <div className="flex items-center justify-between w-full p-4 bg-muted/30 rounded-lg border">
                            <div className="space-y-0.5">
                                <Label className="text-base">Estado de la lección</Label>
                                <p className="text-xs text-muted-foreground">
                                    {published ? "Publicado (Visible para alumnos)" : "Borrador (Oculto)"}
                                </p>
                            </div>
                            <Switch
                                checked={published}
                                onCheckedChange={setPublished}
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-6 border-t">
                            <Button variant="outline" asChild>
                                <Link href={`/admin/cursos/temas/${params.id}/cursos/${params.courseId}`}>
                                    Cancelar
                                </Link>
                            </Button>
                            <Button type="submit" disabled={saving}>
                                {saving ? "Guardando..." : "Guardar Cambios"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
