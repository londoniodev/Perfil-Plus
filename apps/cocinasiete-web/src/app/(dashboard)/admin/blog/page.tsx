"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, redirect } from "next/navigation";
import { useEffect, useState, useCallback, useMemo } from "react";
import { API_BASE, TENANT_ID } from "@/lib/config";
import { Pagination, AdminPageWrapper, BlogCard, Button, useToast, IconPlus, StatusFilter, StatusFilterType } from "@alvarosky/ui";
import { Input } from "@alvarosky/ui";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@alvarosky/ui";
import Link from "next/link";
import { Search, SortAsc, SortDesc, Loader2 } from "lucide-react";

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

type SortType = "newest" | "oldest" | "title";

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
    const [filter, setFilter] = useState<StatusFilterType>("all");
    const [sort, setSort] = useState<SortType>("newest");
    const [search, setSearch] = useState("");
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Redirigir si no es admin
    if (!authLoading && !isAdmin) {
        redirect("/perfil");
    }

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

    // Filtrar y ordenar localmente
    const filteredAndSortedPosts = useMemo(() => {
        let result = [...posts];

        // Filtrar por búsqueda
        if (search) {
            const searchLower = search.toLowerCase();
            result = result.filter(post =>
                post.title.toLowerCase().includes(searchLower) ||
                post.slug.toLowerCase().includes(searchLower)
            );
        }

        // Ordenar
        result.sort((a, b) => {
            switch (sort) {
                case "newest":
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case "oldest":
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                case "title":
                    return a.title.localeCompare(b.title);
                default:
                    return 0;
            }
        });

        return result;
    }, [posts, search, sort]);

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

            {/* Filter Tabs */}
            <div className="mb-4">
                <StatusFilter
                    value={filter}
                    onValueChange={(v) => { setFilter(v); setPage(1); }}
                />
            </div>

            {/* Search and Sort Controls */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por título o slug..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Select value={sort} onValueChange={(v) => setSort(v as SortType)}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Ordenar por" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="newest">Más recientes</SelectItem>
                        <SelectItem value="oldest">Más antiguos</SelectItem>
                        <SelectItem value="title">Título A-Z</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Cards View (Grid) */}
            {loading ? (
                <div className="flex h-48 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredAndSortedPosts.map((post) => (
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
            )}

            {/* Pagination */}
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
