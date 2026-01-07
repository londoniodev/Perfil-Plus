"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../../admin.module.css";

interface Category {
    id: string;
    name: string;
}

interface Tag {
    id: string;
    name: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export default function NuevoPostPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);

    const [form, setForm] = useState({
        title: "",
        excerpt: "",
        content: "",
        coverImage: "",
        published: false,
        isPremium: false,
        categoryId: "",
        tagIds: [] as string[],
    });

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    useEffect(() => {
        if (!token) {
            router.push("/admin/login");
            return;
        }
        fetchMetadata();
    }, [token]);

    const fetchMetadata = async () => {
        try {
            const [catRes, tagRes] = await Promise.all([
                fetch(`${API_BASE}/blog/categories`),
                fetch(`${API_BASE}/blog/tags`),
            ]);
            setCategories(await catRes.json());
            setTags(await tagRes.json());
        } catch (err) {
            console.error("Error loading metadata", err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE}/admin/blog/posts`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...form,
                    categoryId: form.categoryId || undefined,
                    tagIds: form.tagIds.length > 0 ? form.tagIds : undefined,
                }),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || "Error al crear post");
            }

            router.push("/admin/blog");
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleTag = (tagId: string) => {
        setForm((prev) => ({
            ...prev,
            tagIds: prev.tagIds.includes(tagId)
                ? prev.tagIds.filter((id) => id !== tagId)
                : [...prev.tagIds, tagId],
        }));
    };

    return (
        <div className={`${styles.adminPage} ${styles.adminPageForm}`}>
            <div className={styles.adminHeader}>
                <div>
                    <Link href="/admin/blog" className={styles.backLink}>← Volver</Link>
                    <h1>Nuevo Artículo</h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className={styles.postForm}>
                <div className={styles.formGroup}>
                    <label>Título *</label>
                    <input
                        type="text"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        required
                        minLength={5}
                        placeholder="Título del artículo"
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>Resumen *</label>
                    <textarea
                        value={form.excerpt}
                        onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                        required
                        minLength={10}
                        maxLength={500}
                        rows={3}
                        placeholder="Breve descripción del artículo"
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>Contenido *</label>
                    <textarea
                        value={form.content}
                        onChange={(e) => setForm({ ...form, content: e.target.value })}
                        required
                        minLength={100}
                        rows={15}
                        placeholder="Contenido del artículo (puedes usar HTML)"
                    />
                </div>

                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label>Imagen de portada (URL)</label>
                        <input
                            type="url"
                            value={form.coverImage}
                            onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                            placeholder="https://..."
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Categoría</label>
                        <select
                            value={form.categoryId}
                            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                        >
                            <option value="">Sin categoría</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {tags.length > 0 && (
                    <div className={styles.formGroup}>
                        <label>Tags</label>
                        <div className={styles.tagsList}>
                            {tags.map((tag) => (
                                <button
                                    key={tag.id}
                                    type="button"
                                    className={`${styles.tagBtn} ${form.tagIds.includes(tag.id) ? styles.selected : ""}`}
                                    onClick={() => toggleTag(tag.id)}
                                >
                                    {tag.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className={`${styles.formRow} ${styles.checkboxes}`}>
                    <label className={styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            checked={form.published}
                            onChange={(e) => setForm({ ...form, published: e.target.checked })}
                        />
                        Publicar ahora
                    </label>

                    <label className={styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            checked={form.isPremium}
                            onChange={(e) => setForm({ ...form, isPremium: e.target.checked })}
                        />
                        Contenido Premium
                    </label>
                </div>

                <div className={styles.formActions}>
                    <Link href="/admin/blog" className={styles.btnSecondary}>Cancelar</Link>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? "Guardando..." : "Crear Artículo"}
                    </button>
                </div>
            </form>
        </div>
    );
}
