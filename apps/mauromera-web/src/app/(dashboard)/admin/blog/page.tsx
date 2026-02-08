"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useMemo } from "react";
import { API_BASE, TENANT_ID } from "@/lib/config";
import { DataTable } from "@alvarosky/ui";
import { Tabs, TabsList, TabsTrigger } from "@alvarosky/ui";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@alvarosky/ui";
import { Badge } from "@alvarosky/ui";
import { useToast } from "@alvarosky/ui";
import { IconPlus, IconEdit, IconTrash, IconEye, IconEyeOff } from "@alvarosky/ui";
import { Pagination } from "@alvarosky/ui";
import { PageHeader } from "@alvarosky/ui";
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

    // Columnas
    const columns = useMemo<ColumnDef<Post>[]>(() => [
        {
            accessorKey: "title",
            header: "Título",
            cell: ({ row }) => {
                const post = row.original;
                return (
                    <div className="flex items-center gap-3">
                        {post.coverImage && (
                            <img src={post.coverImage} alt="" className="w-10 h-10 object-cover rounded" />
                        )}
                        <div className="flex flex-col">
                            <Link href={`/admin/blog/editar/${post.id}`} className="font-medium hover:underline">
                                {post.title}
                            </Link>
                            <span className="text-xs text-muted-foreground">{post.slug}</span>
                        </div>
                    </div>
                )
            }
        },
        {
            accessorKey: "status",
            header: "Estado",
            cell: ({ row }) => (
                <div className="flex gap-2">
                    <Badge variant={row.original.published ? "default" : "secondary"} className={row.original.published ? "bg-green-600 hover:bg-green-700" : ""}>
                        {row.original.published ? "Publicado" : "Borrador"}
                    </Badge>
                    {row.original.isPremium && (
                        <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200">Premium</Badge>
                    )}
                </div>
            )
        },
        {
            accessorKey: "date",
            header: "Fecha",
            cell: ({ row }) => (
                <span className="text-xs text-muted-foreground">
                    {new Date(row.original.createdAt).toLocaleDateString()}
                </span>
            )
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const post = row.original;
                const isLoading = actionLoading === post.id;
                return (
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            disabled={isLoading}
                            onClick={() => handleTogglePublish(post)}
                            title={post.published ? "Despublicar" : "Publicar"}
                        >
                            {post.published ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            asChild
                        >
                            <Link href={`/admin/blog/editar/${post.id}`}>
                                <IconEdit className="h-4 w-4" />
                            </Link>
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            disabled={isLoading}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(post.id, post.title)}
                        >
                            <IconTrash className="h-4 w-4" />
                        </Button>
                    </div>
                );
            }
        }
    ], [actionLoading]);

    if (authLoading) return <div className="p-8 text-center text-muted-foreground">Cargando...</div>;
    if (!isAdmin) return null;

    return (
        <div className="space-y-6">
            <PageHeader
                title="Gestión del Blog"
                description="Gestiona tus artículos y publicaciones"
            >
                <Button onClick={() => router.push("/admin/blog/nuevo")}>
                    <IconPlus className="mr-2 h-4 w-4" />
                    Nuevo Post
                </Button>
            </PageHeader>

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

            {/* Desktop View */}
            <div className="bg-card rounded-md border hidden md:block">
                <DataTable columns={columns} data={posts} searchKey="title" />
            </div>

            {/* Mobile View */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
                {posts.map((post) => (
                    <div key={post.id} className="bg-card rounded-lg border shadow-sm p-4 space-y-3">
                        <div className="flex justify-between items-start gap-2">
                            <div className="space-y-1">
                                <Link href={`/admin/blog/editar/${post.id}`} className="font-semibold text-lg line-clamp-2 leading-tight hover:underline">
                                    {post.title}
                                </Link>
                                <p className="text-xs text-muted-foreground">
                                    {new Date(post.createdAt).toLocaleDateString()} • {post.slug}
                                </p>
                            </div>
                            <Badge variant={post.published ? "default" : "secondary"} className={post.published ? "bg-green-600 hover:bg-green-700 shrink-0" : "shrink-0"}>
                                {post.published ? "Publicado" : "Borrador"}
                            </Badge>
                        </div>

                        {post.coverImage && (
                            <img src={post.coverImage} alt="" className="w-full h-32 object-cover rounded-md" />
                        )}

                        <div className="flex items-center justify-end gap-2 pt-2 border-t">
                            <Button
                                variant="ghost"
                                size="sm"
                                disabled={actionLoading === post.id}
                                onClick={() => handleTogglePublish(post)}
                            >
                                {post.published ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
                            </Button>
                            <Button variant="outline" size="sm" asChild className="flex-1">
                                <Link href={`/admin/blog/editar/${post.id}`}>
                                    <IconEdit className="h-4 w-4 mr-2" />
                                    Editar
                                </Link>
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                disabled={actionLoading === post.id}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleDelete(post.id, post.title)}
                            >
                                <IconTrash className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}
                {!loading && posts.length === 0 && (
                    <div className="text-center p-8 text-muted-foreground border rounded-lg bg-card">
                        No hay posts para mostrar en la vista móvil.
                    </div>
                )}
            </div>

            <div className="mt-4">
                <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                />
            </div>
        </div>
    );
}

