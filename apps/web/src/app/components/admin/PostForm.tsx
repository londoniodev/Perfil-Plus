"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { API_BASE } from "@/lib/config";
import BlogEditor from "./BlogEditor";
import ImageUploader from "./ImageUploader";
import CategorySelector, { Category } from "./CategorySelector";
import TagSelector, { Tag } from "./TagSelector";
import ToggleButton, { PremiumIcon, PublishIcon } from "./ToggleButton";

// ============================================================================
// TIPOS
// ============================================================================

export interface PostFormData {
    title: string;
    excerpt: string;
    content: string;
    coverImage: string | null;
    isPremium: boolean;
    published: boolean;
    categoryId: string;
    tagIds: string[];
    metaTitle: string;
    metaDescription: string;
}

interface PostFormProps {
    mode: "create" | "edit";
    postId?: string;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function PostForm({ mode, postId }: PostFormProps) {
    const { isAdmin, loading: authLoading } = useAuth();
    const router = useRouter();

    // Estado del formulario
    const [title, setTitle] = useState("");
    const [excerpt, setExcerpt] = useState("");
    const [content, setContent] = useState("");
    const [coverImage, setCoverImage] = useState<string | null>(null);
    const [isPremium, setIsPremium] = useState(false);
    const [published, setPublished] = useState(false);
    const [categoryId, setCategoryId] = useState("");
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [metaTitle, setMetaTitle] = useState("");
    const [metaDescription, setMetaDescription] = useState("");

    // Estado de datos
    const [categories, setCategories] = useState<Category[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(mode === "edit");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Redirigir si no es admin
    useEffect(() => {
        if (!authLoading && !isAdmin) {
            router.push("/perfil");
        }
    }, [isAdmin, authLoading, router]);

    // Cargar datos iniciales (categorías, tags, y post si es modo edit)
    useEffect(() => {
        const fetchData = async () => {
            try {
                const requests: Promise<Response>[] = [
                    fetch(`${API_BASE}/blog/categories`),
                    fetch(`${API_BASE}/blog/tags`),
                ];

                // Si es modo edición, también cargar el post
                if (mode === "edit" && postId) {
                    requests.push(
                        fetch(`${API_BASE}/admin/blog/posts/${postId}`, { credentials: "include" })
                    );
                }

                const results = await Promise.all(requests);
                const [catRes, tagRes, postRes] = results;

                if (catRes.ok) {
                    setCategories(await catRes.json());
                }

                if (tagRes.ok) {
                    setTags(await tagRes.json());
                }

                // Cargar datos del post existente
                if (postRes) {
                    if (!postRes.ok) {
                        throw new Error("Post no encontrado");
                    }
                    const post = await postRes.json();
                    setTitle(post.title);
                    setExcerpt(post.excerpt);
                    setContent(post.content);
                    setCoverImage(post.coverImage);
                    setIsPremium(post.isPremium);
                    setPublished(post.published);
                    setCategoryId(post.categories[0]?.id || "");
                    setSelectedTags(post.tags.map((t: Tag) => t.id));
                    setMetaTitle(post.metaTitle || "");
                    setMetaDescription(post.metaDescription || "");
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : "Error al cargar datos");
            } finally {
                setLoading(false);
            }
        };

        if (isAdmin) fetchData();
    }, [isAdmin, mode, postId]);

    // Manejar envío del formulario
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim() || !excerpt.trim() || !content.trim()) {
            setError("Título, extracto y contenido son obligatorios");
            return;
        }

        if (mode === "create" && content.length < 100) {
            setError("El contenido debe tener al menos 100 caracteres");
            return;
        }

        setSaving(true);
        setError(null);

        try {
            const url = mode === "create"
                ? `${API_BASE}/admin/blog/posts`
                : `${API_BASE}/admin/blog/posts/${postId}`;

            const res = await fetch(url, {
                method: mode === "create" ? "POST" : "PATCH",
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
                    metaDescription: metaDescription || undefined,
                }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || `Error al ${mode === "create" ? "crear" : "actualizar"} el post`);
            }

            router.push("/admin/blog");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error desconocido");
        } finally {
            setSaving(false);
        }
    };

    // Estados de carga
    if (authLoading || loading) {
        return <div style={{ padding: "2rem", textAlign: "center" }}>Cargando...</div>;
    }

    if (!isAdmin) {
        return null;
    }

    return (
        <div style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
            {/* Header con botón volver */}
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
                        marginBottom: "1rem",
                    }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Volver al listado
                </button>
                <h1 style={{ fontSize: "2rem", fontWeight: 700, color: "var(--foreground)" }}>
                    {mode === "create" ? "Nuevo Post" : "Editar Post"}
                </h1>
            </div>

            {/* Mensaje de error */}
            {error && (
                <div style={{
                    padding: "1rem",
                    background: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid rgba(239, 68, 68, 0.3)",
                    borderRadius: "0.5rem",
                    color: "#ef4444",
                    marginBottom: "1.5rem",
                }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div style={{ display: "grid", gap: "1.5rem" }}>
                    {/* Título */}
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

                    {/* Extracto */}
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

                    {/* Imagen de portada */}
                    <ImageUploader
                        value={coverImage}
                        onChange={setCoverImage}
                        label="Imagen de portada"
                        folder="blog-covers"
                    />

                    {/* Editor de contenido */}
                    <div>
                        <label style={labelStyle}>Contenido *</label>
                        <BlogEditor
                            value={content}
                            onChange={setContent}
                            placeholder="Escribe el contenido del artículo..."
                        />
                    </div>

                    {/* Fila de configuración: Categoría + Toggles */}
                    <div style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "1.5rem",
                        padding: "1rem",
                        background: "var(--card-bg)",
                        border: "1px solid var(--border)",
                        borderRadius: "0.5rem",
                    }}>
                        {/* Selector de categoría */}
                        <div style={{ flex: 1, minWidth: "250px" }}>
                            <CategorySelector
                                categories={categories}
                                selectedId={categoryId}
                                onChange={setCategoryId}
                                onCategoryCreated={(cat) => setCategories((prev) => [...prev, cat])}
                            />
                        </div>

                        {/* Toggles Premium/Publicado */}
                        <div style={{ display: "flex", gap: "1rem", alignItems: "flex-end", paddingBottom: "0.25rem" }}>
                            <ToggleButton
                                active={isPremium}
                                onClick={() => setIsPremium(!isPremium)}
                                label="Premium"
                                activeColor="#8b5cf6"
                                icon={<PremiumIcon />}
                                activeIcon={<PremiumIcon filled color="#8b5cf6" />}
                            />
                            <ToggleButton
                                active={published}
                                onClick={() => setPublished(!published)}
                                label={published ? "Publicado" : "Borrador"}
                                activeColor="#22c55e"
                                icon={<PublishIcon published={false} />}
                                activeIcon={<PublishIcon published />}
                            />
                        </div>
                    </div>

                    {/* Selector de tags */}
                    <TagSelector
                        tags={tags}
                        selectedIds={selectedTags}
                        onChange={setSelectedTags}
                    />

                    {/* Sección SEO */}
                    <div style={{
                        padding: "1rem",
                        background: "var(--card-bg)",
                        border: "1px solid var(--border)",
                        borderRadius: "0.5rem",
                    }}>
                        <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem", color: "var(--foreground)" }}>
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

                    {/* Botones de acción */}
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
                                cursor: "pointer",
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
                                fontWeight: 600,
                            }}
                        >
                            {saving
                                ? "Guardando..."
                                : mode === "create"
                                    ? (published ? "Publicar" : "Guardar borrador")
                                    : "Guardar cambios"}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}

// ============================================================================
// ESTILOS
// ============================================================================

const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.875rem",
    fontWeight: 500,
    color: "var(--foreground)",
    marginBottom: "0.5rem",
};

const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.75rem",
    background: "var(--card-bg)",
    border: "1px solid var(--border)",
    borderRadius: "0.5rem",
    color: "var(--foreground)",
    fontSize: "1rem",
};
