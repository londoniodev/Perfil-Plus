"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { API_BASE, TENANT_ID } from "@/lib/config";
import { BlogEditor, VideoUploader } from "@alvarosky/ui";
import { useToast } from "@alvarosky/ui";
import { IconVideo, IconUpload, IconPlay, IconClock, IconList, IconDocument, IconBack } from "@alvarosky/ui";
import { Button } from "@alvarosky/ui";
import { Input } from "@alvarosky/ui";
import { Label } from "@alvarosky/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@alvarosky/ui";
import { Switch } from "@alvarosky/ui";

export default function NuevaLeccionPage() {
    const params = useParams();
    const router = useRouter();
    const toast = useToast();
    const [loading, setLoading] = useState(false);

    // Form state
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [videoUrl, setVideoUrl] = useState("");
    const [videoType, setVideoType] = useState<"upload" | "youtube">("upload");
    const [duration, setDuration] = useState(0);
    const [order, setOrder] = useState(0);
    const [published, setPublished] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE}/admin/lms/lessons`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "x-tenant-id": TENANT_ID },
                credentials: "include",
                body: JSON.stringify({
                    courseId: params.courseId,
                    title,
                    content,
                    videoUrl,
                    duration: Number(duration),
                    order: Number(order),
                    published,
                }),
            });

            if (!res.ok) throw new Error("Error al crear lección");

            toast.success("Lección creada correctamente");
            router.push(`/admin/cursos/temas/${params.id}/cursos/${params.courseId}`);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Error al guardar");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
            <Link href={`/admin/cursos/temas/${params.id}/cursos/${params.courseId}`} className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <IconBack size={16} />
                Volver al curso
            </Link>

            <Card className="border-border">
                <CardHeader>
                    <CardTitle className="text-2xl">Nueva Lección</CardTitle>
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
                                    value={videoUrl}
                                    onChange={(url) => setVideoUrl(url || "")}
                                    folder="lms-videos"
                                    apiBase={API_BASE}
                                    tenantId={TENANT_ID}
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
                            <Button type="submit" disabled={loading}>
                                {loading ? "Guardando..." : "Crear Lección"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
