"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import BlogEditor from "@/app/components/admin/BlogEditor";
import ImageUploader from "@/app/components/admin/ImageUploader";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.mauromera.com/api";

interface Category {
    id: string;
    name: string;
    slug: string;
}

interface Tag {
    id: string;
    name: string;
}

export default function NewPostPage() {
    const { isAdmin, loading: authLoading } = useAuth();
    const router = useRouter();

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
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading && !isAdmin) {
            router.push("/perfil");
        }
    }, [isAdmin, authLoading, router]);

    useEffect(() => {
        // Fetch categories and tags
        const fetchData = async () => {
            try {
                const [catRes, tagRes] = await Promise.all([
                    fetch(`${API_BASE}/blog/categories`),
                    fetch(`${API_BASE}/blog/tags`)
                ]);

                if (catRes.ok) {
                    const catData = await catRes.json();
                    setCategories(catData);
                }

                if (tagRes.ok) {
                    const tagData = await tagRes.json();
                    setTags(tagData);
                }
            } catch (err) {
                console.error("Error fetching data:", err);
            }
        };

        if (isAdmin) fetchData();
    }, [isAdmin]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim() || !excerpt.trim() || !content.trim()) {
            setError("Título, extracto y contenido son obligatorios");
            return;
        }

        if (content.length < 100) {
            setError("El contenido debe tener al menos 100 caracteres");
            return;
        }

        setSaving(true);
        setError(null);

        try {
            const res = await fetch(`${API_BASE}/admin/blog/posts`, {
                method: "POST",
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
                    tagIds: selectedTags.length > 0 ? selectedTags : undefined,
                    metaTitle: metaTitle || undefined,
                    metaDescription: metaDescription || undefined
                }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || "Error al crear el post");
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

    if (authLoading) {
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
                    Nuevo Post
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
                            placeholder="Breve descripción del artículo (se muestra en listados)"
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
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        {/* Category */}
                        <div>
                            <label style={labelStyle}>Categoría</label>
                            <select
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                                style={inputStyle}
                            >
                                <option value="">Sin categoría</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Toggles */}
                        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
                            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                                <input
                                    type="checkbox"
                                    checked={isPremium}
                                    onChange={(e) => setIsPremium(e.target.checked)}
                                    style={{ width: "18px", height: "18px" }}
                                />
                                <span style={{ color: "var(--foreground)" }}>Premium</span>
                            </label>
                            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                                <input
                                    type="checkbox"
                                    checked={published}
                                    onChange={(e) => setPublished(e.target.checked)}
                                    style={{ width: "18px", height: "18px" }}
                                />
                                <span style={{ color: "var(--foreground)" }}>Publicar</span>
                            </label>
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
                        <h3 style={{
                            fontSize: "1rem",
                            fontWeight: 600,
                            marginBottom: "1rem",
                            color: "var(--foreground)"
                        }}>
                            SEO
                        </h3>
                        <div style={{ display: "grid", gap: "1rem" }}>
                            <div>
                                <label style={labelStyle}>Meta título (max. 70 caracteres)</label>
                                <input
                                    type="text"
                                    value={metaTitle}
                                    onChange={(e) => setMetaTitle(e.target.value)}
                                    placeholder={title || "Título para motores de búsqueda"}
                                    maxLength={70}
                                    style={inputStyle}
                                />
                                <p style={{ fontSize: "0.75rem", color: "var(--foreground-muted)", marginTop: "0.25rem" }}>
                                    {metaTitle.length}/70
                                </p>
                            </div>
                            <div>
                                <label style={labelStyle}>Meta descripción (max. 160 caracteres)</label>
                                <textarea
                                    value={metaDescription}
                                    onChange={(e) => setMetaDescription(e.target.value)}
                                    placeholder={excerpt || "Descripción para motores de búsqueda"}
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

                    {/* Submit Button */}
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
                            {saving ? "Guardando..." : (published ? "Publicar" : "Guardar borrador")}
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
