"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_BASE } from "@/lib/config";
import styles from "../ebook-form.module.css";

export default function NewEbookPage() {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [published, setPublished] = useState(false);
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [fullFile, setFullFile] = useState<File | null>(null);
    const [previewFile, setPreviewFile] = useState<File | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !description || !price || !coverFile || !fullFile) {
            alert("Por favor completa todos los campos requeridos");
            return;
        }

        try {
            setSubmitting(true);

            // 1. Upload Cover
            const coverFormData = new FormData();
            coverFormData.append("file", coverFile);
            const coverRes = await fetch(`${API_BASE}/storage/upload/image`, {
                method: "POST",
                credentials: "include",
                body: coverFormData,
            });
            if (!coverRes.ok) throw new Error("Error al subir imagen");
            const coverData = await coverRes.json();

            // 2. Upload Full eBook (Private)
            const fullFormData = new FormData();
            fullFormData.append("file", fullFile);
            const fullRes = await fetch(`${API_BASE}/storage/upload/ebook`, {
                method: "POST",
                credentials: "include",
                body: fullFormData,
            });
            if (!fullRes.ok) throw new Error("Error al subir eBook");
            const fullData = await fullRes.json();

            // 3. Upload Preview (Optional)
            let previewUrl = undefined;
            if (previewFile) {
                const previewFormData = new FormData();
                previewFormData.append("file", previewFile);
                const previewRes = await fetch(`${API_BASE}/storage/upload?folder=ebook-previews`, {
                    method: "POST",
                    credentials: "include",
                    body: previewFormData,
                });
                if (previewRes.ok) {
                    const previewData = await previewRes.json();
                    previewUrl = previewData.url;
                }
            }

            // 4. Create eBook
            const res = await fetch(`${API_BASE}/admin/ebooks`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    title,
                    description,
                    price: parseFloat(price),
                    published,
                    coverImage: coverData.url,
                    fileUrl: fullData.url,
                    previewUrl,
                }),
            });

            if (!res.ok) throw new Error("Error al crear eBook");
            router.push("/admin/ebooks");
            router.refresh();
        } catch (error) {
            alert(error instanceof Error ? error.message : "Error");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <h1 className={styles.title}>✨ Nuevo E-book</h1>
                <Link href="/admin/ebooks" className={styles.backBtn}>
                    ← Cancelar
                </Link>
            </div>

            <form onSubmit={handleSubmit} className={styles.grid}>
                {/* LEFT COLUMN */}
                <div className={styles.leftColumn}>
                    {/* Info Card */}
                    <div className={styles.card}>
                        <h2 className={styles.cardTitle}>📝 Información</h2>

                        <div className={styles.field}>
                            <label>Título del Libro *</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Ej. Liderazgo Consciente"
                                required
                            />
                        </div>

                        <div className={styles.field}>
                            <label>Descripción *</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Escribe una descripción atractiva..."
                                rows={5}
                                required
                            />
                        </div>
                    </div>

                    {/* Files Card */}
                    <div className={styles.card}>
                        <h2 className={styles.cardTitle}>📁 Archivos</h2>

                        <div className={styles.filesGrid}>
                            {/* Full PDF */}
                            <label className={`${styles.fileBox} ${fullFile ? styles.fileBoxActive : ''}`}>
                                <input
                                    type="file"
                                    accept=".pdf,.epub"
                                    onChange={(e) => setFullFile(e.target.files?.[0] || null)}
                                    hidden
                                />
                                <div className={styles.fileIcon}>🔒</div>
                                <div className={styles.fileName}>
                                    {fullFile ? fullFile.name : "PDF Completo *"}
                                </div>
                                <div className={styles.fileHint}>Privado - Solo tras compra</div>
                            </label>

                            {/* Preview PDF */}
                            <label className={`${styles.fileBox} ${previewFile ? styles.fileBoxActive : ''}`}>
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={(e) => setPreviewFile(e.target.files?.[0] || null)}
                                    hidden
                                />
                                <div className={styles.fileIcon}>👁️</div>
                                <div className={styles.fileName}>
                                    {previewFile ? previewFile.name : "Vista Previa"}
                                </div>
                                <div className={styles.fileHint}>Público - Muestra gratuita</div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className={styles.rightColumn}>
                    {/* Cover Card */}
                    <div className={styles.card}>
                        <h2 className={styles.cardTitle}>🖼️ Portada</h2>
                        <label className={`${styles.coverBox} ${coverFile ? styles.coverBoxActive : ''}`}>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                                hidden
                            />
                            {coverFile ? (
                                <img src={URL.createObjectURL(coverFile)} alt="Preview" className={styles.coverPreview} />
                            ) : (
                                <>
                                    <div className={styles.coverIcon}>📸</div>
                                    <div>Click para subir imagen</div>
                                </>
                            )}
                        </label>
                    </div>

                    {/* Settings Card */}
                    <div className={styles.card}>
                        <h2 className={styles.cardTitle}>⚙️ Configuración</h2>

                        <div className={styles.field}>
                            <label>Precio (COP) *</label>
                            <div className={styles.priceInput}>
                                <span>$</span>
                                <input
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    placeholder="0"
                                    min="0"
                                    step="1000"
                                    required
                                />
                            </div>
                        </div>

                        <label className={styles.toggleRow}>
                            <div>
                                <div className={styles.toggleLabel}>Publicar</div>
                                <div className={styles.toggleHint}>
                                    {published ? "Visible en tienda" : "Guardado como borrador"}
                                </div>
                            </div>
                            <div className={`${styles.toggle} ${published ? styles.toggleOn : ''}`} onClick={() => setPublished(!published)}>
                                <div className={styles.toggleCircle}></div>
                            </div>
                        </label>
                    </div>

                    {/* Submit */}
                    <button type="submit" disabled={submitting} className={styles.submitBtn}>
                        {submitting ? "⏳ Creando..." : "🚀 Crear E-book"}
                    </button>
                </div>
            </form>
        </div>
    );
}
