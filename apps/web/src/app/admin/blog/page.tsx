"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "../admin.module.css";

interface Post {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    published: boolean;
    isPremium: boolean;
    createdAt: string;
    categories: { id: string; name: string }[];
}

interface PaginatedResponse {
    data: Post[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

import { API_BASE } from "@/lib/config";

export default function AdminBlogPage() {
    const router = useRouter();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filter, setFilter] = useState<"all" | "published" | "draft">("all");

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    useEffect(() => {
        if (!token) {
            router.push("/admin/login");
            return;
        }
        fetchPosts();
    }, [page, filter, token]);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const publishedParam = filter === "published" ? "true" : filter === "draft" ? "false" : "";
            const url = `${API_BASE}/admin/blog/posts?page=${page}&limit=10${publishedParam ? `&published=${publishedParam}` : ""}`;

            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) throw new Error("Error al cargar posts");

            const data: PaginatedResponse = await res.json();
            setPosts(data.data);
            setTotalPages(data.meta.totalPages);
        } catch (err) {
            setError("No se pudieron cargar los posts");
        } finally {
            setLoading(false);
        }
    };

    const deletePost = async (id: string, title: string) => {
        if (!confirm(`¿Eliminar "${title}"?`)) return;

        try {
            const res = await fetch(`${API_BASE}/admin/blog/posts/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) throw new Error("Error al eliminar");
            fetchPosts();
        } catch (err) {
            alert("Error al eliminar el post");
        }
    };

    return (
        <div className={styles.adminPage}>
            <div className={styles.adminHeader}>
                <h1>Gestión de Blog</h1>
                <Link href="/admin/blog/nuevo" className="btn btn-primary">
                    + Nuevo Artículo
                </Link>
            </div>

            <div className={styles.adminFilters}>
                <button
                    className={`${styles.filterBtn} ${filter === "all" ? styles.active : ""}`}
                    onClick={() => { setFilter("all"); setPage(1); }}
                >
                    Todos
                </button>
                <button
                    className={`${styles.filterBtn} ${filter === "published" ? styles.active : ""}`}
                    onClick={() => { setFilter("published"); setPage(1); }}
                >
                    Publicados
                </button>
                <button
                    className={`${styles.filterBtn} ${filter === "draft" ? styles.active : ""}`}
                    onClick={() => { setFilter("draft"); setPage(1); }}
                >
                    Borradores
                </button>
            </div>

            {loading ? (
                <div className={styles.loading}>Cargando...</div>
            ) : error ? (
                <div className={styles.error}>{error}</div>
            ) : posts.length === 0 ? (
                <div className={styles.empty}>
                    <p>No hay artículos. ¡Crea el primero!</p>
                </div>
            ) : (
                <>
                    <table className={styles.adminTable}>
                        <thead>
                            <tr>
                                <th>Título</th>
                                <th>Estado</th>
                                <th>Tipo</th>
                                <th>Fecha</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {posts.map((post) => (
                                <tr key={post.id}>
                                    <td>
                                        <div className={styles.postTitle}>
                                            <strong>{post.title}</strong>
                                            <span className={styles.postExcerpt}>{post.excerpt.substring(0, 60)}...</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${post.published ? styles.published : styles.draft}`}>
                                            {post.published ? "Publicado" : "Borrador"}
                                        </span>
                                    </td>
                                    <td>
                                        {post.isPremium ? (
                                            <span className={styles.premiumBadge}>Premium</span>
                                        ) : (
                                            <span className={styles.freeBadge}>Público</span>
                                        )}
                                    </td>
                                    <td>
                                        {new Date(post.createdAt).toLocaleDateString("es-CO")}
                                    </td>
                                    <td>
                                        <div className={styles.actions}>
                                            <Link href={`/blog/${post.slug}`} target="_blank" className={styles.actionBtn}>
                                                👁️
                                            </Link>
                                            <Link href={`/admin/blog/editar/${post.id}`} className={styles.actionBtn}>
                                                ✏️
                                            </Link>
                                            <button
                                                onClick={() => deletePost(post.id, post.title)}
                                                className={`${styles.actionBtn} ${styles.delete}`}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {totalPages > 1 && (
                        <div className={styles.pagination}>
                            <button
                                disabled={page === 1}
                                onClick={() => setPage((p) => p - 1)}
                            >
                                ← Anterior
                            </button>
                            <span>Página {page} de {totalPages}</span>
                            <button
                                disabled={page === totalPages}
                                onClick={() => setPage((p) => p + 1)}
                            >
                                Siguiente →
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
