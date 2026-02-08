"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { ImageUploader } from "@alvarosky/ui";
import { API_BASE, TENANT_ID } from "@/lib/config";
import { IconBack } from "@alvarosky/ui";
import { useToast } from "@alvarosky/ui";
import { Button } from "@alvarosky/ui";
import { Input } from "@alvarosky/ui";
import { Textarea } from "@alvarosky/ui";
import { Label } from "@alvarosky/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@alvarosky/ui";
import { Switch } from "@alvarosky/ui";

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
    const toast = useToast();

    useEffect(() => {
        params.then((p) => setThemeId(p.id));
    }, [params]);

    if (authLoading) {
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

        if (!formData.description.trim()) {
            toast.error("La descripción es requerida");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(`${API_BASE}/admin/lms/courses`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "x-tenant-id": TENANT_ID },
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

            toast.success("Curso creado correctamente");
            router.push(`/admin/cursos/temas/${themeId}`);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Error desconocido");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
            <Link href={`/admin/cursos/temas/${themeId}`} className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <IconBack size={16} />
                Volver al Tema
            </Link>

            <Card className="border-border">
                <CardHeader>
                    <CardTitle className="text-2xl">Nuevo Curso</CardTitle>
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
                                placeholder="Ej: Introducción a React"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Descripción *</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="¿Qué aprenderán los estudiantes en este curso?"
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
                                label="Imagen de portada"
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
                                <Link href={`/admin/cursos/temas/${themeId}`}>Cancelar</Link>
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? "Guardando..." : "Crear Curso"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
