"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { API_BASE } from "@/lib/config";
import PostsGrid, { Post } from "@/components/admin/blog/PostsGrid";
import FilterTabs from "@/components/ui/FilterTabs";
import Pagination from "@/components/ui/Pagination";
import { IconPlus } from "@/components/ui/Icons";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import styles from "@/styles/admin.module.css";

// ============================================================================
// TIPOS
// ============================================================================

type FilterType = "all" | "published" | "draft";

interface PostsResponse {
    data: Post[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

const FILTER_TABS: { id: FilterType; label: string }[] = [
    { id: "all", label: "Todos" },
    { id: "published", label: "Publicados" },
    { id: "draft", label: "Borradores" },
];

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
                { credentials: "include" }
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

    // Manejadores de acciones
    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`¿Eliminar el post "${title}"?`)) return;

        try {
            const res = await fetch(`${API_BASE}/admin/blog/posts/${id}`, {
                method: "DELETE",
                credentials: "include",
            });
            if (!res.ok) throw new Error("Error al eliminar");
            fetchPosts();
            toast.success("Post eliminado correctamente");
        } catch {
            toast.error("Error al eliminar el post");
        }
    };

    const handleTogglePublish = async (post: Post) => {
        try {
            const res = await fetch(`${API_BASE}/admin/blog/posts/${post.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ published: !post.published }),
            });
            if (!res.ok) throw new Error("Error al actualizar");
            fetchPosts();
            toast.success(post.published ? "Post despublicado" : "Post publicado");
        } catch {
            toast.error("Error al actualizar el post");
        }
    };

    const handleFilterChange = (newFilter: FilterType) => {
        setFilter(newFilter);
        setPage(1);
    };

    // Estados de carga y autenticación
    if (authLoading) {
        return <div className="state-loading">Cargando...</div>;
    }

    if (!isAdmin) {
        return null;
    }

    return (
        <div className={styles.adminPageWrapper}>
            {/* Header */}
            <div className="page-header">
                <h1>Gestión del Blog</h1>
                <Button onClick={() => router.push("/admin/blog/nuevo")}>
                    <IconPlus size={20} />
                    Nuevo Post
                </Button>
            </div>

            {/* Filtros */}
            <div className="search-bar">
                <FilterTabs
                    tabs={FILTER_TABS}
                    activeTab={filter}
                    onChange={handleFilterChange}
                />
            </div>

            {/* Contenido */}
            {loading ? (
                <div className="state-loading">
                    Cargando posts...
                </div>
            ) : posts.length === 0 ? (
                <EmptyState filter={filter} onCreateNew={() => router.push("/admin/blog/nuevo")} />
            ) : (
                <>
                    <PostsGrid
                        posts={posts}
                        onDelete={handleDelete}
                        onTogglePublish={handleTogglePublish}
                    />
                    <div className={styles.paginationWrapper}>
                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            onPageChange={setPage}
                        />
                    </div>
                </>
            )}
        </div>
    );
}

// ============================================================================
// COMPONENTE AUXILIAR
// ============================================================================

interface EmptyStateProps {
    filter: FilterType;
    onCreateNew: () => void;
}

function EmptyState({ filter, onCreateNew }: EmptyStateProps) {
    const filterText = filter === "published" ? " publicados" :
        filter === "draft" ? " en borrador" : "";

    return (
        <div className={styles.emptyState}>
            <p>No hay posts{filterText}</p>
            <Button onClick={onCreateNew}>
                Crear primer post
            </Button>
        </div>
    );
}
