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
import { Switch, AdminPageWrapper } from "@alvarosky/ui";

export default function NuevoTemaPage() {
    const { isAdmin, loading: authLoading } = useAuth();
    const router = useRouter();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        coverImage: null as string | null,
        order: 0,
        published: false,
    });
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    useEffect(() => {
        if (!authLoading && !isAdmin) {
            router.push("/perfil");
        }
    }, [authLoading, isAdmin, router]);

    if (authLoading) {
        return <div className="p-8 text-center text-muted-foreground">Cargando...</div>;
    }

    if (!isAdmin) return null;

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
            const res = await fetch(`${API_BASE}/admin/lms/themes`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "x-tenant-id": TENANT_ID },
                credentials: "include",
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Error al crear tema");
            }

            toast.success("Tema creado correctamente");
            router.push("/academia/cursos");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Error desconocido");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminPageWrapper
            title="Nuevo Tema"
            className="p-6 md:p-8 max-w-4xl mx-auto space-y-8"
            actions={
                <Button variant="ghost" asChild className="gap-2">
                    <Link href="/academia/cursos">
                        <IconBack size={16} />
                        Volver a Temas
                    </Link>
                </Button>
            }
        >
            <Card className="border-border">
                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Título *</Label>
                            <Input
                                id="title"
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Ej: Liderazgo y Gestión"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Descripción *</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Describe de qué trata este tema..."
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
                                <Link href="/academia/cursos">Cancelar</Link>
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? "Guardando..." : "Crear Tema"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </AdminPageWrapper>
    );
}

