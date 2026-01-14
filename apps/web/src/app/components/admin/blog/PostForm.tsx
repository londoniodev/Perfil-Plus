"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { API_BASE } from "@/lib/config";
import BlogEditor from "./BlogEditor";
import ImageUploader from "@/app/components/admin/ui/ImageUploader";
import CategorySelector, { Category } from "./CategorySelector";
import TagSelector, { Tag } from "./TagSelector";
import ToggleButton, { PremiumIcon, PublishIcon } from "@/app/components/admin/ui/ToggleButton";
import styles from "@/app/styles/admin.module.css";
import { IconBack } from "@/app/components/ui/Icons";

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
        <div className={styles.pageContainer}>
            {/* Header con botón volver */}
            <div className={styles.pageHeader}>
                <div className={styles.backButtonWrapper}>
                    <button
                        onClick={() => router.push("/admin/blog")}
                        className={styles.btnGhost}
                    >
                        <IconBack />
                        Volver al listado
                    </button>
                </div>
                <h1 className={styles.headerTitle}>
                    {mode === "create" ? "Nuevo Post" : "Editar Post"}
                </h1>
            </div>

            {/* Mensaje de error */}
            {error && (
                <div style={{
                    padding: "1rem",
                    background: "var(--error-bg)",
                    border: "1px solid var(--error-border)",
                    borderRadius: "0.5rem",
                    color: "#ef4444",
                    marginBottom: "1.5rem",
                }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className={styles.gridGap}>
                    {/* Título */}
                    <div>
                        <label className={styles.label}>Título *</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Título del artículo"
                            className={styles.input}
                            required
                        />
                    </div>

                    {/* Extracto */}
                    <div>
                        <label className={styles.label}>Extracto *</label>
                        <textarea
                            value={excerpt}
                            onChange={(e) => setExcerpt(e.target.value)}
                            placeholder="Breve descripción del artículo (se muestra en listados)"
                            rows={3}
                            className={styles.textarea}
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
                        <label className={styles.label}>Contenido *</label>
                        <BlogEditor
                            value={content}
                            onChange={setContent}
                            placeholder="Escribe el contenido del artículo..."
                        />
                    </div>

                    {/* Fila de configuración: Categoría + Toggles */}
                    <div className={styles.card}>
                        <div className={styles.flexWrapGap}>
                            {/* Selector de categoría */}
                            <div className={styles.flexGrow}>
                                <CategorySelector
                                    categories={categories}
                                    selectedId={categoryId}
                                    onChange={setCategoryId}
                                    onCategoryCreated={(cat) => setCategories((prev) => [...prev, cat])}
                                />
                            </div>

                            {/* Toggles Premium/Publicado */}
                            <div className={styles.flexEndGap}>
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
                    </div>

                    {/* Selector de tags */}
                    <TagSelector
                        tags={tags}
                        selectedIds={selectedTags}
                        onChange={setSelectedTags}
                    />

                    {/* Sección SEO */}
                    <div className={styles.card}>
                        <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "1rem", color: "var(--foreground)" }}>
                            SEO
                        </h3>
                        <div className={styles.gridGap}>
                            <div>
                                <label className={styles.label}>Meta título (max. 70 caracteres)</label>
                                <input
                                    type="text"
                                    value={metaTitle}
                                    onChange={(e) => setMetaTitle(e.target.value)}
                                    placeholder={title || "Título para motores de búsqueda"}
                                    maxLength={70}
                                    className={styles.input}
                                />
                                <p className={styles.helperText}>
                                    {metaTitle.length}/70
                                </p>
                            </div>
                            <div>
                                <label className={styles.label}>Meta descripción (max. 160 caracteres)</label>
                                <textarea
                                    value={metaDescription}
                                    onChange={(e) => setMetaDescription(e.target.value)}
                                    placeholder={excerpt || "Descripción para motores de búsqueda"}
                                    maxLength={160}
                                    rows={2}
                                    className={`${styles.textarea} resize-none`}
                                />
                                <p className={styles.helperText}>
                                    {metaDescription.length}/160
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className={styles.flexEnd}>
                        <button
                            type="button"
                            onClick={() => router.push("/admin/blog")}
                            className={styles.btnSecondary}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className={styles.btnPrimary}
                            style={saving ? { opacity: 0.7, cursor: "wait" } : {}}
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
