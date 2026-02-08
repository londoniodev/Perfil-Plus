"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { API_BASE, TENANT_ID } from "@/lib/config";
import BlogEditor from "./BlogEditor";
import { ImageUploader } from "@alvarosky/ui";
import CategorySelector from "./CategorySelector";
import TagSelector from "./TagSelector";
import { ToggleButton, PremiumIcon, PublishIcon } from "@alvarosky/ui";
import { IconBack } from "@alvarosky/ui";
import { useToast } from "@alvarosky/ui";
import { Input } from "@alvarosky/ui";
import { Textarea } from "@alvarosky/ui"; // Need to ensure Textarea exists, or use native with class
import { Button } from "@alvarosky/ui";
import { Card, CardContent } from "@alvarosky/ui"; // Use shadcn Card if available or div
import { Label } from "@alvarosky/ui";
import { Switch } from "@alvarosky/ui"; // Recommended replacement for ToggleButton

// ============================================================================
// TIPOS
// ============================================================================

import { Category, Tag, PostFormData } from "@/types/blog";

interface PostFormProps {
    mode: "create" | "edit";
    postId?: string;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function PostForm({ mode, postId }: PostFormProps) {
    const { isAdmin, loading: authLoading } = useAuth();
    const router = useRouter();
    const toast = useToast();

    // Estado del formulario
    const [title, setTitle] = useState("");
    const [excerpt, setExcerpt] = useState("");
    const [content, setContent] = useState("");
    const [coverImage, setCoverImage] = useState<string | null>(null);
    const [isPremium, setIsPremium] = useState(false);
    const [published, setPublished] = useState(false);
    const [categoryId, setCategoryId] = useState("");
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [metaTitle, setMetaTitle] = useState("");
    const [metaDescription, setMetaDescription] = useState("");

    // Estado de datos
    const [categories, setCategories] = useState<Category[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(mode === "edit");
    const [saving, setSaving] = useState(false);

    // Redirigir si no es admin
    useEffect(() => {
        if (!authLoading && !isAdmin) {
            router.push("/perfil");
        }
    }, [isAdmin, authLoading, router]);

    // Cargar datos iniciales
    useEffect(() => {
        const fetchData = async () => {
            try {
                const requests: Promise<Response>[] = [
                    fetch(`${API_BASE}/blog/categories`, { headers: { 'x-tenant-id': TENANT_ID } }),
                    fetch(`${API_BASE}/blog/tags`, { headers: { 'x-tenant-id': TENANT_ID } }),
                ];

                if (mode === "edit" && postId) {
                    requests.push(
                        fetch(`${API_BASE}/admin/blog/posts/${postId}`, { headers: { 'x-tenant-id': TENANT_ID }, credentials: "include" })
                    );
                }

                const results = await Promise.all(requests);
                const [catRes, tagRes, postRes] = results;

                if (catRes.ok) setCategories(await catRes.json());
                if (tagRes.ok) setTags(await tagRes.json());

                if (postRes) {
                    if (!postRes.ok) throw new Error("Post no encontrado");
                    const post = await postRes.json();
                    setTitle(post.title);
                    setExcerpt(post.excerpt);
                    setContent(post.content);
                    setCoverImage(post.coverImage);
                    setIsPremium(post.isPremium);
                    setPublished(post.published);
                    setCategoryId(post.categories[0]?.id || "");
                    setSelectedTags(post.tags.map((t: Tag) => t.id));
                    setMetaTitle(post.metaTitle || "");
                    setMetaDescription(post.metaDescription || "");
                }
            } catch (err) {
                toast.error(err instanceof Error ? err.message : "Error al cargar datos");
            } finally {
                setLoading(false);
            }
        };

        if (isAdmin) fetchData();
    }, [isAdmin, mode, postId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim() || !excerpt.trim() || !content.trim()) {
            toast.error("Título, extracto y contenido son obligatorios");
            return;
        }

        if (mode === "create" && content.length < 100) {
            toast.error("El contenido debe tener al menos 100 caracteres");
            return;
        }

        setSaving(true);

        try {
            const url = mode === "create"
                ? `${API_BASE}/admin/blog/posts`
                : `${API_BASE}/admin/blog/posts/${postId}`;

            const res = await fetch(url, {
                method: mode === "create" ? "POST" : "PATCH",
                headers: { "Content-Type": "application/json", "x-tenant-id": TENANT_ID },
                credentials: "include",
                body: JSON.stringify({
                    title,
                    excerpt,
                    content,
                    coverImage,
                    isPremium,
                    published,
                    categoryId: categoryId || undefined,
                    tagIds: selectedTags.length > 0 ? selectedTags : undefined,
                    metaTitle: metaTitle || undefined,
                    metaDescription: metaDescription || undefined,
                }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || `Error al ${mode === "create" ? "crear" : "actualizar"} el post`);
            }

            toast.success(mode === "create" ? "Post creado correctamente" : "Post actualizado correctamente");
            router.push("/admin/blog");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Error desconocido");
        } finally {
            setSaving(false);
        }
    };

    if (authLoading || loading) return <div className="p-8 text-center text-muted-foreground">Cargando...</div>;
    if (!isAdmin) return null;

    return (
        <div className="max-w-5xl mx-auto py-6 space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => router.push("/admin/blog")} className="gap-2">
                        <IconBack className="h-4 w-4" />
                        Volver
                    </Button>
                    <h1 className="text-2xl font-bold tracking-tight">
                        {mode === "create" ? "Nuevo Post" : "Editar Post"}
                    </h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="title">Título *</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Título del artículo"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="excerpt">Extracto *</Label>
                        <textarea
                            id="excerpt"
                            value={excerpt}
                            onChange={(e) => setExcerpt(e.target.value)}
                            placeholder="Breve descripción..."
                            rows={3}
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            required
                        />
                    </div>

                    <ImageUploader
                        value={coverImage}
                        onChange={setCoverImage}
                        label="Imagen de portada"
                        folder="blog-covers"
                        apiBase={API_BASE}
                        tenantId={TENANT_ID}
                    />

                    <div className="space-y-2">
                        <Label>Contenido *</Label>
                        <BlogEditor
                            value={content}
                            onChange={setContent}
                            placeholder="Escribe el contenido del artículo..."
                        />
                    </div>

                    {/* Settings Panel */}
                    <div className="grid gap-6 md:grid-cols-2 p-6 border rounded-lg bg-card">
                        <div className="space-y-4">
                            <Label>Categoría</Label>
                            <CategorySelector
                                categories={categories}
                                selectedId={categoryId}
                                onChange={setCategoryId}
                                onCategoryCreated={(cat) => setCategories(prev => [...prev, cat])}
                            />
                        </div>

                        <div className="flex flex-col gap-4 justify-center">
                            <div className="flex items-center justify-between p-4 border rounded-md">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Premium</Label>
                                    <p className="text-xs text-muted-foreground">Contenido exclusivo para suscriptores</p>
                                </div>
                                <Switch checked={isPremium} onCheckedChange={setIsPremium} />
                            </div>
                            <div className="flex items-center justify-between p-4 border rounded-md">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Publicado</Label>
                                    <p className="text-xs text-muted-foreground">Visible para los usuarios</p>
                                </div>
                                <Switch checked={published} onCheckedChange={setPublished} />
                            </div>
                        </div>
                    </div>

                    <TagSelector
                        tags={tags}
                        selectedIds={selectedTags}
                        onChange={setSelectedTags}
                    />

                    {/* SEO */}
                    <div className="p-6 border rounded-lg bg-card space-y-4">
                        <h3 className="font-semibold">SEO</h3>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Meta Título</Label>
                                <Input
                                    value={metaTitle}
                                    onChange={(e) => setMetaTitle(e.target.value)}
                                    placeholder={title}
                                    maxLength={70}
                                />
                                <p className="text-xs text-muted-foreground text-right">{metaTitle.length}/70</p>
                            </div>
                            <div className="space-y-2">
                                <Label>Meta Descripción</Label>
                                <textarea
                                    value={metaDescription}
                                    onChange={(e) => setMetaDescription(e.target.value)}
                                    placeholder={excerpt}
                                    maxLength={160}
                                    rows={2}
                                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                                />
                                <p className="text-xs text-muted-foreground text-right">{metaDescription.length}/160</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <Button type="button" variant="outline" onClick={() => router.push("/admin/blog")}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={saving}>
                            {saving ? "Guardando..." : "Guardar Cambios"}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}

