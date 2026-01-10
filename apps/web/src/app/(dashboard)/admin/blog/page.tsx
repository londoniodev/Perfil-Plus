"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { API_BASE } from "@/lib/config";

interface Post {
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
    categories: { id: string; name: string }[];
    tags: { id: string; name: string }[];
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

export default function AdminBlogPage() {
    const { isAdmin, loading: authLoading } = useAuth();
    const router = useRouter();

    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');

    useEffect(() => {
        if (!authLoading && !isAdmin) {
            router.push("/perfil");
        }
    }, [isAdmin, authLoading, router]);

    const fetchPosts = async () => {
        setLoading(true);
        setError(null);
        try {
            const publishedParam = filter === 'published' ? '&published=true' :
                filter === 'draft' ? '&published=false' : '';
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
    };

    useEffect(() => {
        if (isAdmin) {
            fetchPosts();
        }
    }, [isAdmin, page, filter]);

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`¿Eliminar el post "${title}"?`)) return;

        try {
            const res = await fetch(`${API_BASE}/admin/blog/posts/${id}`, {
                method: "DELETE",
                credentials: "include",
            });
            if (!res.ok) throw new Error("Error al eliminar");
            fetchPosts();
        } catch (err) {
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
        } catch (err) {
            alert("Error al actualizar el post");
        }
    };

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
                gap: "1rem"
            }}>
                <h1 style={{
                    fontSize: "2rem",
                    fontWeight: 700,
                    color: "var(--foreground)"
                }}>
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
                        gap: "0.5rem"
                    }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14M5 12h14" />
                    </svg>
                    Nuevo Post
                </button>
            </div>

            {/* Filters */}
            <div style={{
                display: "flex",
                gap: "0.5rem",
                marginBottom: "1.5rem",
                flexWrap: "wrap"
            }}>
                {(['all', 'published', 'draft'] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => { setFilter(f); setPage(1); }}
                        style={{
                            padding: "0.5rem 1rem",
                            background: filter === f ? "var(--accent)" : "var(--card-bg)",
                            color: filter === f ? "white" : "var(--foreground)",
                            border: "1px solid var(--border)",
                            borderRadius: "0.375rem",
                            cursor: "pointer",
                            fontSize: "0.875rem"
                        }}
                    >
                        {f === 'all' ? 'Todos' : f === 'published' ? 'Publicados' : 'Borradores'}
                    </button>
                ))}
            </div>

            {/* Error State */}
            {error && (
                <div style={{
                    padding: "1rem",
                    background: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    borderRadius: "0.5rem",
                    color: "#ef4444",
                    marginBottom: "1rem"
                }}>
                    {error}
                </div>
            )}

            {/* Loading State */}
            {loading ? (
                <div style={{ textAlign: "center", padding: "3rem", color: "var(--foreground-muted)" }}>
                    Cargando posts...
                </div>
            ) : posts.length === 0 ? (
                <div style={{
                    textAlign: "center",
                    padding: "3rem",
                    background: "var(--card-bg)",
                    border: "1px solid var(--border)",
                    borderRadius: "1rem"
                }}>
                    <p style={{ color: "var(--foreground-muted)", marginBottom: "1rem" }}>
                        No hay posts {filter !== 'all' ? (filter === 'published' ? 'publicados' : 'en borrador') : ''}
                    </p>
                    <button
                        onClick={() => router.push("/admin/blog/nuevo")}
                        style={{
                            padding: "0.75rem 1.5rem",
                            background: "var(--accent)",
                            color: "white",
                            border: "none",
                            borderRadius: "0.5rem",
                            cursor: "pointer"
                        }}
                    >
                        Crear primer post
                    </button>
                </div>
            ) : (
                <>
                    {/* Posts Table */}
                    <div style={{
                        background: "var(--card-bg)",
                        border: "1px solid var(--border)",
                        borderRadius: "1rem",
                        overflow: "hidden"
                    }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ background: "var(--background)" }}>
                                    <th style={thStyle}>Título</th>
                                    <th style={{ ...thStyle, width: "100px" }}>Estado</th>
                                    <th style={{ ...thStyle, width: "100px" }}>Tipo</th>
                                    <th style={{ ...thStyle, width: "120px" }}>Fecha</th>
                                    <th style={{ ...thStyle, width: "150px" }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {posts.map((post) => (
                                    <tr key={post.id} style={{ borderTop: "1px solid var(--border)" }}>
                                        <td style={tdStyle}>
                                            <div>
                                                <div style={{ fontWeight: 500, color: "var(--foreground)" }}>
                                                    {post.title}
                                                </div>
                                                <div style={{
                                                    fontSize: "0.75rem",
                                                    color: "var(--foreground-muted)",
                                                    marginTop: "0.25rem"
                                                }}>
                                                    /{post.slug}
                                                    {post.readingTime && ` • ${post.readingTime} min lectura`}
                                                </div>
                                            </div>
                                        </td>
                                        <td style={tdStyle}>
                                            <span style={{
                                                padding: "0.25rem 0.5rem",
                                                borderRadius: "0.25rem",
                                                fontSize: "0.75rem",
                                                fontWeight: 500,
                                                background: post.published
                                                    ? "rgba(34, 197, 94, 0.1)"
                                                    : "rgba(234, 179, 8, 0.1)",
                                                color: post.published ? "#22c55e" : "#eab308"
                                            }}>
                                                {post.published ? "Publicado" : "Borrador"}
                                            </span>
                                        </td>
                                        <td style={tdStyle}>
                                            <span style={{
                                                padding: "0.25rem 0.5rem",
                                                borderRadius: "0.25rem",
                                                fontSize: "0.75rem",
                                                fontWeight: 500,
                                                background: post.isPremium
                                                    ? "rgba(139, 92, 246, 0.1)"
                                                    : "rgba(59, 130, 246, 0.1)",
                                                color: post.isPremium ? "#8b5cf6" : "#3b82f6"
                                            }}>
                                                {post.isPremium ? "Premium" : "Gratis"}
                                            </span>
                                        </td>
                                        <td style={{ ...tdStyle, fontSize: "0.875rem", color: "var(--foreground-muted)" }}>
                                            {new Date(post.createdAt).toLocaleDateString('es-CO')}
                                        </td>
                                        <td style={tdStyle}>
                                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                                <button
                                                    onClick={() => handleTogglePublish(post)}
                                                    title={post.published ? "Despublicar" : "Publicar"}
                                                    style={actionBtnStyle}
                                                >
                                                    {post.published ? (
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                                                            <line x1="1" y1="1" x2="23" y2="23" />
                                                        </svg>
                                                    ) : (
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                            <circle cx="12" cy="12" r="3" />
                                                        </svg>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => router.push(`/admin/blog/editar/${post.id}`)}
                                                    title="Editar"
                                                    style={actionBtnStyle}
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(post.id, post.title)}
                                                    title="Eliminar"
                                                    style={{ ...actionBtnStyle, color: "#ef4444" }}
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div style={{
                            display: "flex",
                            justifyContent: "center",
                            gap: "0.5rem",
                            marginTop: "1.5rem"
                        }}>
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                style={{
                                    ...paginationBtnStyle,
                                    opacity: page === 1 ? 0.5 : 1,
                                    cursor: page === 1 ? "not-allowed" : "pointer"
                                }}
                            >
                                Anterior
                            </button>
                            <span style={{
                                padding: "0.5rem 1rem",
                                color: "var(--foreground-muted)",
                                fontSize: "0.875rem"
                            }}>
                                Página {page} de {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                style={{
                                    ...paginationBtnStyle,
                                    opacity: page === totalPages ? 0.5 : 1,
                                    cursor: page === totalPages ? "not-allowed" : "pointer"
                                }}
                            >
                                Siguiente
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

const thStyle: React.CSSProperties = {
    padding: "0.75rem 1rem",
    textAlign: "left",
    fontSize: "0.75rem",
    fontWeight: 600,
    textTransform: "uppercase",
    color: "var(--foreground-muted)",
    letterSpacing: "0.05em"
};

const tdStyle: React.CSSProperties = {
    padding: "1rem",
    verticalAlign: "middle"
};

const actionBtnStyle: React.CSSProperties = {
    padding: "0.5rem",
    background: "var(--background)",
    border: "1px solid var(--border)",
    borderRadius: "0.375rem",
    cursor: "pointer",
    color: "var(--foreground)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
};

const paginationBtnStyle: React.CSSProperties = {
    padding: "0.5rem 1rem",
    background: "var(--card-bg)",
    border: "1px solid var(--border)",
    borderRadius: "0.375rem",
    color: "var(--foreground)",
    fontSize: "0.875rem"
};
