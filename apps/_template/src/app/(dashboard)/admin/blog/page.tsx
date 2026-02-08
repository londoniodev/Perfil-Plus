"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useMemo } from "react";
import { API_BASE, TENANT_ID } from "@/lib/config";
import { DataTable } from "@alvarosky/ui";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@alvarosky/ui";
import { Badge } from "@alvarosky/ui";
import { useToast } from "@alvarosky/ui";
import { IconPlus, IconEdit, IconTrash, IconEye, IconEyeOff } from "@alvarosky/ui";
import { Pagination, AdminPageWrapper } from "@alvarosky/ui";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@alvarosky/ui";
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

type FilterType = "all" | "published" | "draft";
type SortType = "newest" | "oldest" | "title";

// ============================================================================
// POST CARD COMPONENT
// ============================================================================

interface PostCardProps {
    post: Post;
    onDelete: (id: string, title: string) => void;
    onTogglePublish: (post: Post) => void;
    isLoading: boolean;
}

function PostCard({ post, onDelete, onTogglePublish, isLoading }: PostCardProps) {
    return (
        <Card className="overflow-hidden">
            {post.coverImage && (
                <div className="h-32 overflow-hidden">
                    <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover"
                    />
                </div>
            )}
            <CardHeader className="p-4 pb-2">
                <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base line-clamp-2">{post.title}</CardTitle>
                </div>
                <p className="text-xs text-muted-foreground">{post.slug}</p>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <div className="flex gap-2 mb-2">
                    <Badge
                        variant={post.published ? "default" : "secondary"}
                        className={post.published ? "bg-green-600 hover:bg-green-700" : ""}
                    >
                        {post.published ? "Publicado" : "Borrador"}
                    </Badge>
                    {post.isPremium && (
                        <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200">
                            Premium
                        </Badge>
                    )}
                </div>
                <p className="text-xs text-muted-foreground">
                    {new Date(post.createdAt).toLocaleDateString()}
                </p>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex justify-end gap-1">
                <Button
                    variant="ghost"
                    size="icon"
                    disabled={isLoading}
                    onClick={() => onTogglePublish(post)}
                    title={post.published ? "Despublicar" : "Publicar"}
                >
                    {post.published ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" asChild>
                    <Link href={`/admin/blog/editar/${post.id}`}>
                        <IconEdit className="h-4 w-4" />
                    </Link>
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    disabled={isLoading}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => onDelete(post.id, post.title)}
                >
                    <IconTrash className="h-4 w-4" />
                </Button>
            </CardFooter>
        </Card>
    );
}

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
    const [sort, setSort] = useState<SortType>("newest");
    const [search, setSearch] = useState("");
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

    // Columnas para DataTable (versión desktop)
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
            <div className="flex items-center gap-2 border-b pb-2 overflow-x-auto">
                {(["all", "published", "draft"] as FilterType[]).map((t) => (
                    <Button
                        key={t}
                        variant={filter === t ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => { setFilter(t); setPage(1); }}
                        className="capitalize"
                    >
                        {t === "all" ? "Todos" : t === "published" ? "Publicados" : "Borradores"}
                    </Button>
                ))}
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

            {/* Loading State */}
            {loading ? (
                <div className="flex h-48 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <>
                    {/* Mobile: Cards View */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
                        {filteredAndSortedPosts.length === 0 ? (
                            <div className="col-span-full py-16 px-4 text-center bg-muted/30 border border-dashed rounded-xl">
                                <h2 className="text-xl font-semibold mb-2">No hay posts</h2>
                                <p className="text-muted-foreground mb-6">
                                    {search ? "No se encontraron resultados." : "Crea tu primer post para comenzar."}
                                </p>
                                {!search && (
                                    <Button onClick={() => router.push("/admin/blog/nuevo")}>
                                        <IconPlus className="mr-2 h-4 w-4" />
                                        Crear Post
                                    </Button>
                                )}
                            </div>
                        ) : (
                            filteredAndSortedPosts.map((post) => (
                                <PostCard
                                    key={post.id}
                                    post={post}
                                    onDelete={handleDelete}
                                    onTogglePublish={handleTogglePublish}
                                    isLoading={actionLoading === post.id}
                                />
                            ))
                        )}
                    </div>

                    {/* Desktop: Table View */}
                    <div className="hidden md:block bg-card rounded-md border">
                        <DataTable columns={columns} data={filteredAndSortedPosts} searchKey="title" />
                    </div>
                </>
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
