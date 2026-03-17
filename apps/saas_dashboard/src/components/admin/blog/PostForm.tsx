"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { postSchema, PostFormValues } from "@alvarosky/features";
import { useAuth } from "@/context/AuthContext";
import { API_BASE, TENANT_ID } from "@/lib/config";
import { 
    BlogEditor, 
    ImageUploader, 
    IconBack, 
    useToast, 
    Input, 
    Textarea, 
    Button, 
    AdminPageWrapper, 
    Switch,
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription
} from "@alvarosky/ui";
import CategorySelector from "./CategorySelector";
import TagSelector from "./TagSelector";

import { Category, Tag } from "@/types/blog";

interface PostFormProps {
    mode: "create" | "edit";
    postId?: string;
}

export default function PostForm({ mode, postId }: PostFormProps) {
    const { isAdmin, loading: authLoading } = useAuth();
    const router = useRouter();
    const toast = useToast();

    // Estado de datos auxiliares (no del formulario)
    const [categories, setCategories] = useState<Category[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(mode === "edit");

    const form = useForm<PostFormValues>({
        resolver: zodResolver(postSchema) as any,
        defaultValues: {
            title: "",
            excerpt: "",
            content: "",
            coverImage: null,
            isPremium: false,
            published: false,
            categoryId: "",
            tagIds: [],
            metaTitle: "",
            metaDescription: "",
        },
    });

    // Redirigir si no es admin
    useEffect(() => {
        if (!authLoading && !isAdmin) {
            router.push("/perfil");
        }
    }, [authLoading, isAdmin, router]);

    // Cargar datos iniciales
    useEffect(() => {
        const controller = new AbortController();

        const fetchData = async () => {
            try {
                const requests: Promise<Response>[] = [
                    fetch(`${API_BASE}/blog/categories`, { headers: { 'x-tenant-id': TENANT_ID }, signal: controller.signal }),
                    fetch(`${API_BASE}/blog/tags`, { headers: { 'x-tenant-id': TENANT_ID }, signal: controller.signal }),
                ];

                if (mode === "edit" && postId) {
                    requests.push(
                        fetch(`${API_BASE}/admin/blog/posts/${postId}`, { headers: { 'x-tenant-id': TENANT_ID }, credentials: "include", signal: controller.signal })
                    );
                }

                const results = await Promise.all(requests);
                const [catRes, tagRes, postRes] = results;

                if (catRes.ok) setCategories(await catRes.json());
                if (tagRes.ok) setTags(await tagRes.json());

                if (postRes) {
                    if (!postRes.ok) throw new Error("Post no encontrado");
                    const post = await postRes.json();
                    
                    form.reset({
                        title: post.title,
                        excerpt: post.excerpt,
                        content: post.content,
                        coverImage: post.coverImage,
                        isPremium: post.isPremium,
                        published: post.published,
                        categoryId: post.categories[0]?.id || "",
                        tagIds: post.tags.map((t: Tag) => t.id),
                        metaTitle: post.metaTitle || "",
                        metaDescription: post.metaDescription || "",
                    });
                }
            } catch (err) {
                if ((err as Error).name !== 'AbortError') {
                    toast.error(err instanceof Error ? err.message : "Error al cargar datos");
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        if (isAdmin) fetchData();

        return () => controller.abort();
    }, [isAdmin, mode, postId, form, toast]);

    const onSubmit = async (values: PostFormValues) => {
        try {
            const url = mode === "create"
                ? `${API_BASE}/admin/blog/posts`
                : `${API_BASE}/admin/blog/posts/${postId}`;

            const res = await fetch(url, {
                method: mode === "create" ? "POST" : "PATCH",
                headers: { "Content-Type": "application/json", "x-tenant-id": TENANT_ID },
                credentials: "include",
                body: JSON.stringify(values),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || `Error al ${mode === "create" ? "crear" : "actualizar"} el post`);
            }

            toast.success(mode === "create" ? "Post creado correctamente" : "Post actualizado correctamente");
            router.push("/blog/publicaciones");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Error desconocido");
        }
    };

    if (authLoading || loading) return <div className="p-8 text-center text-muted-foreground">Cargando...</div>;
    if (!isAdmin) return null;

    return (
        <AdminPageWrapper
            title={mode === "create" ? "Nuevo Post" : "Editar Post"}
            className="max-w-5xl mx-auto py-6 space-y-8"
            actions={
                <Button variant="ghost" onClick={() => router.push("/blog/publicaciones")} className="gap-2">
                    <IconBack className="h-4 w-4" />
                    Volver
                </Button>
            }
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div className="grid gap-6">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Título *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Título del artículo" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="excerpt"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Extracto *</FormLabel>
                                    <FormControl>
                                        <Textarea 
                                            placeholder="Breve descripción..." 
                                            className="min-h-[80px]" 
                                            {...field} 
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="coverImage"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Imagen de portada</FormLabel>
                                    <FormControl>
                                        <ImageUploader
                                            apiBase={API_BASE}
                                            tenantId={TENANT_ID}
                                            value={field.value || null}
                                            onChange={field.onChange}
                                            label="Imagen de portada"
                                            folder="blog-covers"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="content"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Contenido *</FormLabel>
                                    <FormControl>
                                        <BlogEditor
                                            value={field.value}
                                            onChange={field.onChange}
                                            placeholder="Escribe el contenido del artículo..."
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid gap-6 md:grid-cols-2 p-6 border rounded-lg bg-card">
                            <FormField
                                control={form.control}
                                name="categoryId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Categoría</FormLabel>
                                        <FormControl>
                                            <CategorySelector
                                                categories={categories}
                                                selectedId={field.value}
                                                onChange={field.onChange}
                                                onCategoryCreated={(cat) => setCategories(prev => [...prev, cat])}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex flex-col gap-4 justify-center">
                                <FormField
                                    control={form.control}
                                    name="isPremium"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center justify-between p-4 border rounded-md space-y-0">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base font-medium">Premium</FormLabel>
                                                <FormDescription>Contenido exclusivo para suscriptores</FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch 
                                                    checked={field.value} 
                                                    onCheckedChange={field.onChange} 
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="published"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center justify-between p-4 border rounded-md space-y-0">
                                            <div className="space-y-0.5">
                                                <FormLabel className="text-base font-medium">Publicado</FormLabel>
                                                <FormDescription>Visible para los usuarios</FormDescription>
                                            </div>
                                            <FormControl>
                                                <Switch 
                                                    checked={field.value} 
                                                    onCheckedChange={field.onChange} 
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <FormField
                            control={form.control}
                            name="tagIds"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Etiquetas</FormLabel>
                                    <FormControl>
                                        <TagSelector
                                            tags={tags}
                                            selectedIds={field.value || []}
                                            onChange={field.onChange}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="p-6 border rounded-lg bg-card space-y-4">
                            <h3 className="font-semibold text-lg">SEO</h3>
                            <div className="grid gap-4 md:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="metaTitle"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Meta Título</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder={form.getValues("title") || "Meta título"}
                                                    maxLength={70}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription className="text-right">
                                                {(field.value?.length || 0)}/70
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="metaDescription"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Meta Descripción</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder={form.getValues("excerpt") || "Meta descripción"}
                                                    maxLength={160}
                                                    className="resize-none"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription className="text-right">
                                                {(field.value?.length || 0)}/160
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4">
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => router.push("/blog/publicaciones")} 
                                className="w-full sm:w-auto"
                            >
                                Cancelar
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={form.formState.isSubmitting} 
                                className="w-full sm:w-auto"
                            >
                                {form.formState.isSubmitting ? "Guardando..." : "Guardar Cambios"}
                            </Button>
                        </div>
                    </div>
                </form>
            </Form>
        </AdminPageWrapper>
    );
}
