"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { API_BASE } from "@/lib/config";
import PostsGrid, { Post } from "@/app/components/admin/PostsGrid";
import FilterTabs from "@/app/components/ui/FilterTabs";
import Pagination from "@/app/components/ui/Pagination";

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

    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
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
        setError(null);
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
            setError(err instanceof Error ? err.message : "Error desconocido");
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
        } catch {
            alert("Error al eliminar el post");
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
        } catch {
            alert("Error al actualizar el post");
        }
    };

    const handleFilterChange = (newFilter: FilterType) => {
        setFilter(newFilter);
        setPage(1);
    };

    // Estados de carga y autenticación
    if (authLoading) {
        return <div style={{ padding: "2rem", textAlign: "center" }}>Cargando...</div>;
    }

    if (!isAdmin) {
        return null;
    }

    return (
        <div style={{ padding: "2rem" }}>
            {/* Header */}
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.5rem",
                flexWrap: "wrap",
                gap: "1rem",
            }}>
                <h1 style={{ fontSize: "2rem", fontWeight: 700, color: "var(--foreground)" }}>
                    Gestión del Blog
                </h1>
                <button
                    onClick={() => router.push("/admin/blog/nuevo")}
                    style={{
                        padding: "0.75rem 1.5rem",
                        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                        color: "white",
                        border: "none",
                        borderRadius: "0.5rem",
                        cursor: "pointer",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                    }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14M5 12h14" />
                    </svg>
                    Nuevo Post
                </button>
            </div>

            {/* Filtros */}
            <div style={{ marginBottom: "1.5rem" }}>
                <FilterTabs
                    tabs={FILTER_TABS}
                    activeTab={filter}
                    onChange={handleFilterChange}
                />
            </div>

            {/* Error */}
            {error && (
                <div style={{
                    padding: "1rem",
                    background: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    borderRadius: "0.5rem",
                    color: "#ef4444",
                    marginBottom: "1rem",
                }}>
                    {error}
                </div>
            )}

            {/* Contenido */}
            {loading ? (
                <div style={{ textAlign: "center", padding: "3rem", color: "var(--foreground-muted)" }}>
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
                    <div style={{ marginTop: "2rem" }}>
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
        <div style={{
            textAlign: "center",
            padding: "3rem",
            background: "var(--card-bg)",
            border: "1px solid var(--border)",
            borderRadius: "1rem",
        }}>
            <p style={{ color: "var(--foreground-muted)", marginBottom: "1rem" }}>
                No hay posts{filterText}
            </p>
            <button
                onClick={onCreateNew}
                style={{
                    padding: "0.75rem 1.5rem",
                    background: "var(--accent)",
                    color: "white",
                    border: "none",
                    borderRadius: "0.5rem",
                    cursor: "pointer",
                }}
            >
                Crear primer post
            </button>
        </div>
    );
}
