"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_BASE } from "@/lib/config";
import styles from "../../cursos/lms.module.css"; // Reuse styles

export default function NewEbookPage() {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);

    // Form States
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [published, setPublished] = useState(false);

    // File States
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

            // 1. Upload Cover Image
            const coverFormData = new FormData();
            coverFormData.append("file", coverFile);
            const coverRes = await fetch(`${API_BASE}/storage/upload/image`, {
                method: "POST",
                credentials: "include",
                body: coverFormData,
            });
            if (!coverRes.ok) throw new Error("Error al subir imagen de portada");
            const coverData = await coverRes.json();
            const coverUrl = coverData.url;

            // 2. Upload Full eBook (Private)
            const fullFormData = new FormData();
            fullFormData.append("file", fullFile);
            const fullRes = await fetch(`${API_BASE}/storage/upload/ebook`, {
                method: "POST",
                credentials: "include",
                body: fullFormData,
            });
            if (!fullRes.ok) throw new Error("Error al subir el eBook completo");
            const fullData = await fullRes.json();
            const fileUrl = fullData.url; // This is the KEY (private), not a public URL

            // 3. Upload Preview (Public) - Optional
            let previewUrl = undefined;
            if (previewFile) {
                const previewFormData = new FormData();
                previewFormData.append("file", previewFile);
                // Use generic upload for public files
                const previewRes = await fetch(`${API_BASE}/storage/upload?folder=ebook-previews`, {
                    method: "POST",
                    credentials: "include",
                    body: previewFormData,
                });
                if (!previewRes.ok) throw new Error("Error al subir el archivo de vista previa");
                const previewData = await previewRes.json();
                previewUrl = previewData.url;
            }

            // 4. Create eBook Record
            const ebookData = {
                title,
                description,
                price: parseFloat(price),
                published,
                coverImage: coverUrl,
                fileUrl,     // Private Key
                previewUrl,  // Public URL
            };

            const res = await fetch(`${API_BASE}/admin/ebooks`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(ebookData),
            });

            if (!res.ok) throw new Error("Error al crear el eBook");

            router.push("/admin/ebooks");
            router.refresh();

        } catch (error) {
            alert(error instanceof Error ? error.message : "Error desconocido");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className={styles.lmsPage}>
            <div className={styles.header}>
                <h1 className={styles.title}>Nuevo E-book</h1>
                <Link href="/admin/ebooks" className={styles.backBtn}>
                    ← Volver
                </Link>
            </div>

            <div className={styles.formContainer} style={{ maxWidth: "800px", margin: "0 auto", background: "var(--card-bg)", padding: "2rem", borderRadius: "1rem", border: "1px solid var(--border)" }}>
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

                    {/* Basic Info */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Título</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className={styles.input}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Descripción</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className={styles.textarea}
                            rows={5}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Precio (COP)</label>
                        <input
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className={styles.input}
                            min="0"
                            step="1000"
                            required
                        />
                    </div>

                    {/* Checkbox */}
                    <div className={styles.formGroup} style={{ flexDirection: "row", alignItems: "center", gap: "0.5rem" }}>
                        <input
                            type="checkbox"
                            checked={published}
                            onChange={(e) => setPublished(e.target.checked)}
                            id="published"
                            style={{ width: "20px", height: "20px" }}
                        />
                        <label htmlFor="published" style={{ marginBottom: 0 }}>Publicar inmediatamente</label>
                    </div>

                    <hr style={{ borderColor: "var(--border)", margin: "1rem 0" }} />

                    {/* Files */}
                    <div className={styles.formGroup}>
                        <label className={styles.label}>Imagen de Portada (Obligatorio)</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                            required
                            style={{ color: "var(--foreground)" }}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Archivo Completo (PDF) - Privado y Protegido (Obligatorio)</label>
                        <input
                            type="file"
                            accept=".pdf,.epub"
                            onChange={(e) => setFullFile(e.target.files?.[0] || null)}
                            required
                            style={{ color: "var(--foreground)" }}
                        />
                        <small style={{ color: "#888", marginTop: "0.5rem" }}>
                            Este archivo se almacenará en un bucket privado y solo será accesible mediante enlaces firmados temporales tras la compra.
                        </small>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Vista Previa (PDF) - Público (Opcional)</label>
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => setPreviewFile(e.target.files?.[0] || null)}
                            style={{ color: "var(--foreground)" }}
                        />
                        <small style={{ color: "#888", marginTop: "0.5rem" }}>
                            Este archivo será accesible públicamente para que los usuarios vean una muestra antes de comprar.
                            <strong> NO subas el libro completo aquí.</strong> Sube solo las primeras páginas.
                        </small>
                    </div>

                    <div className={styles.actions} style={{ marginTop: "2rem" }}>
                        <button
                            type="submit"
                            disabled={submitting}
                            className={styles.saveBtn}
                            style={{ width: "100%", padding: "1rem", fontSize: "1.1rem" }}
                        >
                            {submitting ? "Subiendo archivos y creando..." : "Crear E-book"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
