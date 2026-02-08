"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useMemo } from "react";
import { API_BASE, TENANT_ID } from "@/lib/config";
import { Tabs, TabsList, TabsTrigger } from "@alvarosky/ui";
import { Button } from "@alvarosky/ui";
import { useToast } from "@alvarosky/ui";
import { IconPlus } from "@alvarosky/ui";
import { Pagination, AdminPageWrapper, BlogCard } from "@alvarosky/ui";
import Link from "next/link";

// ============================================================================
// TIPOS
// ============================================================================

export interface Post {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    coverImage: string | null;
    isPremium: boolean;
    published: boolean;
    publishedAt: string | null;
    createdAt: string;
    readingTime: number | null;
}

interface PostsResponse {
    data: Post[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

type FilterType = "all" | "published" | "draft";

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function AdminBlogPage() {
    const { isAdmin, loading: authLoading } = useAuth();
    const router = useRouter();
    const toast = useToast();

    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filter, setFilter] = useState<FilterType>("all");
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Redirigir si no es admin
    useEffect(() => {
        if (!authLoading && !isAdmin) {
            router.push("/perfil");
        }
    }, [isAdmin, authLoading, router]);

    // Cargar posts
    const fetchPosts = useCallback(async () => {
        setLoading(true);
        try {
            const publishedParam =
                filter === "published" ? "&published=true" :
                    filter === "draft" ? "&published=false" : "";

            const res = await fetch(
                `${API_BASE}/admin/blog/posts?page=${page}&limit=10${publishedParam}`,
                { headers: { 'x-tenant-id': TENANT_ID }, credentials: "include" }
            );

            if (!res.ok) throw new Error("Error al cargar posts");

            const data: PostsResponse = await res.json();
            setPosts(data.data);
            setTotalPages(data.meta.totalPages);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Error desconocido");
        } finally {
            setLoading(false);
        }
    }, [page, filter]);

    useEffect(() => {
        if (isAdmin) {
            fetchPosts();
        }
    }, [isAdmin, fetchPosts]);

    // Manejadores
    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`¿Eliminar el post "${title}"?`)) return;
        setActionLoading(id);

        try {
            const res = await fetch(`${API_BASE}/admin/blog/posts/${id}`, {
                method: "DELETE",
                headers: { 'x-tenant-id': TENANT_ID },
                credentials: "include",
            });
            if (!res.ok) throw new Error("Error al eliminar");
            fetchPosts();
            toast.success("Post eliminado correctamente");
        } catch {
            toast.error("Error al eliminar el post");
        } finally {
            setActionLoading(null);
        }
    };

    const handleTogglePublish = async (post: Post) => {
        setActionLoading(post.id);
        try {
            const res = await fetch(`${API_BASE}/admin/blog/posts/${post.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", "x-tenant-id": TENANT_ID },
                credentials: "include",
                body: JSON.stringify({ published: !post.published }),
            });
            if (!res.ok) throw new Error("Error al actualizar");
            fetchPosts();
            toast.success(post.published ? "Post despublicado" : "Post publicado");
        } catch {
            toast.error("Error al actualizar el post");
        } finally {
            setActionLoading(null);
        }
    };



    if (authLoading) return <div className="p-8 text-center text-muted-foreground">Cargando...</div>;
    if (!isAdmin) return null;

    return (
        <AdminPageWrapper
            title="Gestión del Blog"
            description="Gestiona tus artículos y publicaciones"
            actions={
                <Button onClick={() => router.push("/admin/blog/nuevo")}>
                    <IconPlus className="mr-2 h-4 w-4" />
                    Nuevo Post
                </Button>
            }
        >

            {/* Filter Tabs using Buttons */}
            {/* ... resto del código ... */}

            {/* Filter Tabs using Buttons */}
            {/* Filter Tabs */}
            <Tabs defaultValue="all" value={filter} onValueChange={(v) => { setFilter(v as FilterType); setPage(1); }} className="w-full">
                <TabsList>
                    <TabsTrigger value="all">Todos</TabsTrigger>
                    <TabsTrigger value="published">Publicados</TabsTrigger>
                    <TabsTrigger value="draft">Borradores</TabsTrigger>
                </TabsList>
            </Tabs>

            {/* Cards View (Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {posts.map((post) => (
                    <BlogCard
                        key={post.id}
                        post={{
                            ...post,
                            image: post.coverImage || undefined,
                            publishedAt: post.publishedAt ? new Date(post.publishedAt) : null,
                            createdAt: new Date(post.createdAt),
                        }}
                        onDelete={() => handleDelete(post.id, post.title)}
                    />
                ))}
            </div>

            <div className="mt-4">
                <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                />
            </div>
        </AdminPageWrapper>
    );
}

