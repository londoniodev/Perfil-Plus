"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { postSchema, type PostFormValues } from "@alvarosky/features";
import { useAuth } from "@/context/AuthContext";
import { API_BASE, TENANT_ID } from "@/lib/config";
import {
    Button, Input, Textarea, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription,
    useToast, Card, CardContent, CardHeader, CardTitle, CardDescription,
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Switch,
    SingleImageDropzone,
    AdminPageWrapper, IconSave, IconLoader, IconBack,
} from "@alvarosky/ui";
import CategorySelector from "./CategorySelector"
import TagSelector from "./TagSelector"
import { PostBasicInfoForm } from "./post-basic-info-form"
import { PostSettingsForm } from "./post-settings-form"
import { PostSEOForm } from "./post-seo-form"

interface Category {
    id: string;
    name: string;
}

interface Tag {
    id: string;
    name: string;
}

interface PostFormProps {
    mode: "create" | "edit";
    postId?: string;
}

export default function PostForm({ mode, postId }: PostFormProps) {
    const router = useRouter();
    const { user } = useAuth();
    const toast = useToast();
    const [categories, setCategories] = useState<Category[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(mode === "edit");
    const [authToken, setAuthToken] = useState("");

    // Read auth token on client side
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setAuthToken(localStorage.getItem("token") || "");
        }
    }, []);

    const form = useForm<PostFormValues>({
        resolver: standardSchemaResolver(postSchema) as any,
        defaultValues: {
            title: "",
            excerpt: "",
            content: "",
            coverImage: "",
            categoryId: "",
            published: false,
            isPremium: false,
            metaTitle: "",
            metaDescription: "",
        },
    });

    // Fetch initial data for edit mode
    useEffect(() => {
        if (mode === "edit" && postId) {
            const controller = new AbortController();
            fetch(`${API_BASE}/admin/blog/posts/${postId}`, {
                headers: { "x-tenant-id": TENANT_ID },
                credentials: "include",
                signal: controller.signal,
            })
                .then((res) => res.json())
                .then((data) => {
                    form.reset({
                        title: data.title,
                        excerpt: data.excerpt,
                        content: data.content,
                        coverImage: data.coverImage,
                        categoryId: data.categoryId,
                        published: data.published,
                        isPremium: data.isPremium,
                        metaTitle: data.metaTitle || "",
                        metaDescription: data.metaDescription || "",
                    });
                    setLoading(false);
                })
                .catch((err) => {
                    if (err.name !== "AbortError") {
                        toast.error("Error al cargar la publicación");
                        setLoading(false);
                    }
                });
            return () => controller.abort();
        }
    }, [mode, postId, form, toast]);

    // Fetch categories and tags
    useEffect(() => {
        const controller = new AbortController();
        const headers = { "x-tenant-id": TENANT_ID };

        Promise.all([
            fetch(`${API_BASE}/admin/blog/categories`, { headers, credentials: "include", signal: controller.signal }),
            fetch(`${API_BASE}/admin/blog/tags`, { headers, credentials: "include", signal: controller.signal }),
        ])
            .then(async ([catRes, tagRes]) => {
                if (catRes.ok) {
                    const cats = await catRes.json();
                    if (Array.isArray(cats)) setCategories(cats);
                }
                if (tagRes.ok) {
                    const tgs = await tagRes.json();
                    if (Array.isArray(tgs)) setTags(tgs);
                }
            })
            .catch((err) => {
                if (err.name !== "AbortError") {
                    console.error("Error fetching dependencies:", err);
                }
            });

        return () => controller.abort();
    }, []);

    const onSubmit = async (values: PostFormValues) => {
        try {
            const url = mode === "create"
                ? `${API_BASE}/admin/blog/posts`
                : `${API_BASE}/admin/blog/posts/${postId}`;

            const method = mode === "create" ? "POST" : "PATCH";

            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "x-tenant-id": TENANT_ID,
                },
                credentials: "include",
                body: JSON.stringify(values),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || "Error al guardar la publicación");
            }

            toast.success(mode === "create" ? "Publicación creada" : "Publicación actualizada");
            router.push("/blog/publicaciones");
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    if (loading) {
        return (
            <AdminPageWrapper title="Cargando..." description="Un momento por favor...">
                <div className="flex items-center justify-center min-h-[400px]">
                    <IconLoader className="h-8 w-8 animate-spin text-primary" />
                </div>
            </AdminPageWrapper>
        );
    }

    return (
        <AdminPageWrapper
            title={mode === "create" ? "Nueva Publicación" : "Editar Publicación"}
            description="Gestiona el contenido del blog y su visibilidad"
            maxWidth="lg"
        >
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-12">
                    <div className="grid gap-6">
                        <PostBasicInfoForm authToken={authToken} />
                        <PostSettingsForm categories={categories} />
                        <PostSEOForm />

                        <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.push("/blog/publicaciones")}
                                disabled={form.formState.isSubmitting}
                                className="w-full sm:w-auto"
                            >
                                <IconBack className="mr-2 h-4 w-4" />
                                Cancelar
                            </Button>

                            <Button
                                type="submit"
                                disabled={form.formState.isSubmitting}
                                className="w-full sm:w-auto"
                            >
                                {form.formState.isSubmitting ? (
                                    <>
                                        <IconLoader className="mr-2 h-4 w-4 animate-spin" />
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <IconSave className="mr-2 h-4 w-4" />
                                        {mode === "create" ? "Publicar" : "Guardar Cambios"}
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            </Form>
        </AdminPageWrapper>
    );
}
