"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import BlogEditor from "@/app/components/admin/BlogEditor";
import ImageUploader from "@/app/components/admin/ImageUploader";

import { API_BASE } from "@/lib/config";

interface Category {
    id: string;
    name: string;
    slug: string;
}

interface Tag {
    id: string;
    name: string;
}

interface Post {
    id: string;
    title: string;
    excerpt: string;
    content: string;
    coverImage: string | null;
    isPremium: boolean;
    published: boolean;
    metaTitle: string | null;
    metaDescription: string | null;
    categories: Category[];
    tags: Tag[];
}

export default function EditPostPage() {
    const { isAdmin, loading: authLoading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const postId = params.id as string;

    // Form state
    const [title, setTitle] = useState("");
    const [excerpt, setExcerpt] = useState("");
    const [content, setContent] = useState("");
    const [coverImage, setCoverImage] = useState<string | null>(null);
    const [isPremium, setIsPremium] = useState(false);
    const [published, setPublished] = useState(false);
    const [categoryId, setCategoryId] = useState<string>("");
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [metaTitle, setMetaTitle] = useState("");
    const [metaDescription, setMetaDescription] = useState("");

    // Data state
    const [categories, setCategories] = useState<Category[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading && !isAdmin) {
            router.push("/perfil");
        }
    }, [isAdmin, authLoading, router]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch categories, tags, and post data in parallel
                const [catRes, tagRes, postRes] = await Promise.all([
                    fetch(`${API_BASE}/blog/categories`),
                    fetch(`${API_BASE}/blog/tags`),
                    fetch(`${API_BASE}/admin/blog/posts/${postId}`, { credentials: "include" })
                ]);

                if (catRes.ok) {
                    setCategories(await catRes.json());
                }

                if (tagRes.ok) {
                    setTags(await tagRes.json());
                }

                if (!postRes.ok) {
                    throw new Error("Post no encontrado");
                }

                const post: Post = await postRes.json();
                setTitle(post.title);
                setExcerpt(post.excerpt);
                setContent(post.content);
                setCoverImage(post.coverImage);
                setIsPremium(post.isPremium);
                setPublished(post.published);
                setCategoryId(post.categories[0]?.id || "");
                setSelectedTags(post.tags.map(t => t.id));
                setMetaTitle(post.metaTitle || "");
                setMetaDescription(post.metaDescription || "");
            } catch (err) {
                setError(err instanceof Error ? err.message : "Error al cargar el post");
            } finally {
                setLoading(false);
            }
        };

        if (isAdmin && postId) fetchData();
    }, [isAdmin, postId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim() || !excerpt.trim() || !content.trim()) {
            setError("Título, extracto y contenido son obligatorios");
            return;
        }

        setSaving(true);
        setError(null);

        try {
            const res = await fetch(`${API_BASE}/admin/blog/posts/${postId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    title,
                    excerpt,
                    content,
                    coverImage,
                    isPremium,
                    published,
                    categoryId: categoryId || undefined,
                    tagIds: selectedTags,
                    metaTitle: metaTitle || undefined,
                    metaDescription: metaDescription || undefined
                }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || "Error al actualizar el post");
            }

            router.push("/admin/blog");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error desconocido");
        } finally {
            setSaving(false);
        }
    };

    const toggleTag = (tagId: string) => {
        setSelectedTags(prev =>
            prev.includes(tagId)
                ? prev.filter(id => id !== tagId)
                : [...prev, tagId]
        );
    };

    if (authLoading || loading) {
        return <div style={{ padding: "2rem", textAlign: "center" }}>Cargando...</div>;
    }

    if (!isAdmin) {
        return null;
    }

    return (
        <div style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
            {/* Header */}
            <div style={{ marginBottom: "1.5rem" }}>
                <button
                    onClick={() => router.push("/admin/blog")}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        background: "transparent",
                        border: "none",
                        color: "var(--foreground-muted)",
                        cursor: "pointer",
                        padding: 0,
                        marginBottom: "1rem"
                    }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Volver al listado
                </button>
                <h1 style={{
                    fontSize: "2rem",
                    fontWeight: 700,
                    color: "var(--foreground)"
                }}>
                    Editar Post
                </h1>
            </div>

            {/* Error */}
            {error && (
                <div style={{
                    padding: "1rem",
                    background: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    borderRadius: "0.5rem",
                    color: "#ef4444",
                    marginBottom: "1.5rem"
                }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div style={{ display: "grid", gap: "1.5rem" }}>
                    {/* Title */}
                    <div>
                        <label style={labelStyle}>Título *</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Título del artículo"
                            style={inputStyle}
                            required
                        />
                    </div>

                    {/* Excerpt */}
                    <div>
                        <label style={labelStyle}>Extracto *</label>
                        <textarea
                            value={excerpt}
                            onChange={(e) => setExcerpt(e.target.value)}
                            placeholder="Breve descripción del artículo"
                            rows={3}
                            style={{ ...inputStyle, resize: "vertical" }}
                            required
                        />
                    </div>

                    {/* Cover Image */}
                    <ImageUploader
                        value={coverImage}
                        onChange={setCoverImage}
                        label="Imagen de portada"
                        folder="blog-covers"
                    />

                    {/* Content Editor */}
                    <div>
                        <label style={labelStyle}>Contenido *</label>
                        <BlogEditor
                            value={content}
                            onChange={setContent}
                            placeholder="Escribe el contenido del artículo..."
                        />
                    </div>

                    {/* Settings Row */}
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "1fr auto",
                        gap: "1.5rem",
                        padding: "1rem",
                        background: "var(--card-bg)",
                        border: "1px solid var(--border)",
                        borderRadius: "0.5rem"
                    }}>
                        {/* Category */}
                        <div>
                            <label style={labelStyle}>Categoría</label>
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                <select
                                    value={categoryId}
                                    onChange={(e) => setCategoryId(e.target.value)}
                                    style={{ ...inputStyle, flex: 1 }}
                                >
                                    <option value="">Sin categoría</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const name = prompt("Nombre de la nueva categoría:");
                                        if (name && name.trim()) {
                                            fetch(`${API_BASE}/admin/blog/categories`, {
                                                method: "POST",
                                                headers: { "Content-Type": "application/json" },
                                                credentials: "include",
                                                body: JSON.stringify({ name: name.trim() })
                                            })
                                                .then(res => res.json())
                                                .then(newCat => {
                                                    setCategories(prev => [...prev, newCat]);
                                                    setCategoryId(newCat.id);
                                                })
                                                .catch(() => alert("Error al crear categoría"));
                                        }
                                    }}
                                    style={{
                                        padding: "0.75rem",
                                        background: "var(--accent)",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "0.5rem",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center"
                                    }}
                                    title="Crear nueva categoría"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="12" y1="5" x2="12" y2="19" />
                                        <line x1="5" y1="12" x2="19" y2="12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Toggles */}
                        <div style={{ display: "flex", gap: "1rem", alignItems: "flex-end", paddingBottom: "0.25rem" }}>
                            {/* Premium Toggle */}
                            <button
                                type="button"
                                onClick={() => setIsPremium(!isPremium)}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                    padding: "0.5rem 1rem",
                                    background: isPremium ? "rgba(139, 92, 246, 0.15)" : "transparent",
                                    border: isPremium ? "1px solid #8b5cf6" : "1px solid var(--border)",
                                    borderRadius: "0.5rem",
                                    cursor: "pointer",
                                    color: isPremium ? "#8b5cf6" : "var(--foreground-muted)",
                                    transition: "all 0.2s"
                                }}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill={isPremium ? "#8b5cf6" : "none"} stroke="currentColor" strokeWidth="2">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                </svg>
                                <span style={{ fontWeight: 500 }}>Premium</span>
                            </button>

                            {/* Publicar Toggle */}
                            <button
                                type="button"
                                onClick={() => setPublished(!published)}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                    padding: "0.5rem 1rem",
                                    background: published ? "rgba(34, 197, 94, 0.15)" : "transparent",
                                    border: published ? "1px solid #22c55e" : "1px solid var(--border)",
                                    borderRadius: "0.5rem",
                                    cursor: "pointer",
                                    color: published ? "#22c55e" : "var(--foreground-muted)",
                                    transition: "all 0.2s"
                                }}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    {published ? (
                                        <>
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            <circle cx="12" cy="12" r="3" fill="#22c55e" />
                                        </>
                                    ) : (
                                        <>
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                                            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                                            <line x1="1" y1="1" x2="23" y2="23" />
                                        </>
                                    )}
                                </svg>
                                <span style={{ fontWeight: 500 }}>{published ? "Publicado" : "Borrador"}</span>
                            </button>
                        </div>
                    </div>

                    {/* Tags */}
                    {tags.length > 0 && (
                        <div>
                            <label style={labelStyle}>Tags</label>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                                {tags.map(tag => (
                                    <button
                                        key={tag.id}
                                        type="button"
                                        onClick={() => toggleTag(tag.id)}
                                        style={{
                                            padding: "0.375rem 0.75rem",
                                            borderRadius: "9999px",
                                            border: "1px solid var(--border)",
                                            background: selectedTags.includes(tag.id) ? "var(--accent)" : "var(--card-bg)",
                                            color: selectedTags.includes(tag.id) ? "white" : "var(--foreground)",
                                            cursor: "pointer",
                                            fontSize: "0.875rem"
                                        }}
                                    >
                                        {tag.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* SEO Section */}
                    <div style={{
                        padding: "1rem",
                        background: "var(--card-bg)",
                        border: "1px solid var(--border)",
                        borderRadius: "0.5rem"
                    }}>
                        <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem", color: "var(--foreground)" }}>
                            SEO
                        </h3>
                        <div style={{ display: "grid", gap: "1rem" }}>
                            <div>
                                <label style={labelStyle}>Meta título (max. 70)</label>
                                <input
                                    type="text"
                                    value={metaTitle}
                                    onChange={(e) => setMetaTitle(e.target.value)}
                                    placeholder={title || "Título para buscadores"}
                                    maxLength={70}
                                    style={inputStyle}
                                />
                                <p style={{ fontSize: "0.75rem", color: "var(--foreground-muted)", marginTop: "0.25rem" }}>
                                    {metaTitle.length}/70
                                </p>
                            </div>
                            <div>
                                <label style={labelStyle}>Meta descripción (max. 160)</label>
                                <textarea
                                    value={metaDescription}
                                    onChange={(e) => setMetaDescription(e.target.value)}
                                    placeholder={excerpt || "Descripción para buscadores"}
                                    maxLength={160}
                                    rows={2}
                                    style={{ ...inputStyle, resize: "none" }}
                                />
                                <p style={{ fontSize: "0.75rem", color: "var(--foreground-muted)", marginTop: "0.25rem" }}>
                                    {metaDescription.length}/160
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Submit */}
                    <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                        <button
                            type="button"
                            onClick={() => router.push("/admin/blog")}
                            style={{
                                padding: "0.75rem 1.5rem",
                                background: "var(--card-bg)",
                                border: "1px solid var(--border)",
                                borderRadius: "0.5rem",
                                color: "var(--foreground)",
                                cursor: "pointer"
                            }}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            style={{
                                padding: "0.75rem 1.5rem",
                                background: saving ? "var(--foreground-muted)" : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                                color: "white",
                                border: "none",
                                borderRadius: "0.5rem",
                                cursor: saving ? "wait" : "pointer",
                                fontWeight: 600
                            }}
                        >
                            {saving ? "Guardando..." : "Guardar cambios"}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}

const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.875rem",
    fontWeight: 500,
    color: "var(--foreground)",
    marginBottom: "0.5rem"
};

const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.75rem",
    background: "var(--card-bg)",
    border: "1px solid var(--border)",
    borderRadius: "0.5rem",
    color: "var(--foreground)",
    fontSize: "1rem"
};
