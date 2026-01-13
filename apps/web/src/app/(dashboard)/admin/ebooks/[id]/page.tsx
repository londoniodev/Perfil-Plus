"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_BASE } from "@/lib/config";
import styles from "../../ebooks/ebook-form.module.css";

export default function EditEbookPage(props: { params: Promise<{ id: string }> }) {
    const params = use(props.params);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form States
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [published, setPublished] = useState(false);
    const [currentCover, setCurrentCover] = useState("");
    const [hasFullFile, setHasFullFile] = useState(false);
    const [hasPreviewFile, setHasPreviewFile] = useState(false);

    // File States (Only if changing)
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [fullFile, setFullFile] = useState<File | null>(null);
    const [previewFile, setPreviewFile] = useState<File | null>(null);

    useEffect(() => {
        fetchEbook();
    }, []);

    const fetchEbook = async () => {
        try {
            const res = await fetch(`${API_BASE}/admin/ebooks/${params.id}`, {
                credentials: "include",
            });
            if (!res.ok) throw new Error("Error al cargar eBook");
            const data = await res.json();

            setTitle(data.title);
            setDescription(data.description);
            setPrice(data.price);
            setPublished(data.published);
            setCurrentCover(data.coverImage);
            setHasFullFile(!!data.fileUrl);
            setHasPreviewFile(!!data.previewUrl);
        } catch (err) {
            alert(err instanceof Error ? err.message : "Error cargar");
            router.push("/admin/ebooks");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSubmitting(true);

            let coverUrl = undefined;
            if (coverFile) {
                const formData = new FormData();
                formData.append("file", coverFile);
                const res = await fetch(`${API_BASE}/storage/upload/image`, {
                    method: "POST", credentials: "include", body: formData
                });
                if (!res.ok) throw new Error("Error imagen");
                const data = await res.json();
                coverUrl = data.url;
            }

            let fileUrl = undefined;
            if (fullFile) {
                const formData = new FormData();
                formData.append("file", fullFile);
                const res = await fetch(`${API_BASE}/storage/upload/ebook`, {
                    method: "POST", credentials: "include", body: formData
                });
                if (!res.ok) throw new Error("Error eBook");
                const data = await res.json();
                fileUrl = data.url;
            }

            let previewUrl = undefined;
            if (previewFile) {
                const formData = new FormData();
                formData.append("file", previewFile);
                const res = await fetch(`${API_BASE}/storage/upload?folder=ebook-previews`, {
                    method: "POST", credentials: "include", body: formData
                });
                if (!res.ok) throw new Error("Error preview");
                const data = await res.json();
                previewUrl = data.url;
            }

            const ebookData = {
                title,
                description,
                price: parseFloat(price),
                published,
                ...(coverUrl && { coverImage: coverUrl }),
                ...(fileUrl && { fileUrl }),
                ...(previewUrl && { previewUrl }),
            };

            const res = await fetch(`${API_BASE}/admin/ebooks/${params.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(ebookData),
            });

            if (!res.ok) throw new Error("Error actualizar");

            router.push("/admin/ebooks");
            router.refresh();

        } catch (error) {
            alert(error instanceof Error ? error.message : "Error");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className={styles.loading}>Cargando...</div>;

    return (
        <div className={styles.lmsPage}>
            <div className={styles.header}>
                <h1 className={styles.title}>Editar E-book</h1>
                <Link href="/admin/ebooks" className={styles.backBtn}>← Volver</Link>
            </div>

            <div className={styles.formContainer} style={{ maxWidth: "800px", margin: "0 auto", background: "var(--card-bg)", padding: "2rem", borderRadius: "1rem" }}>
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Título</label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} className={styles.input} required />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Descripción</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} className={styles.textarea} rows={5} required />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Precio</label>
                        <input type="number" value={price} onChange={e => setPrice(e.target.value)} className={styles.input} required />
                    </div>

                    <div className={styles.formGroup} style={{ flexDirection: "row", alignItems: "center", gap: "0.5rem" }}>
                        <input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)} id="pub" style={{ width: "20px", height: "20px" }} />
                        <label htmlFor="pub" style={{ marginBottom: 0 }}>Publicado</label>
                    </div>

                    <hr />

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Imagen Portada</label>
                        {currentCover && <img src={currentCover} alt="Cover" style={{ width: "100px", marginBottom: "1rem" }} />}
                        <input type="file" onChange={e => setCoverFile(e.target.files?.[0] || null)} />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Archivo Completo {hasFullFile && "✅ (Ya subido)"}</label>
                        <input type="file" onChange={e => setFullFile(e.target.files?.[0] || null)} />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Vista Previa {hasPreviewFile && "✅ (Ya subido)"}</label>
                        <input type="file" onChange={e => setPreviewFile(e.target.files?.[0] || null)} />
                        <small>Dejar vacío para mantener el actual</small>
                    </div>

                    <button type="submit" disabled={submitting} className={styles.saveBtn} style={{ marginTop: "1rem" }}>
                        {submitting ? "Guardando..." : "Guardar Cambios"}
                    </button>
                </form>
            </div>
        </div>
    );
}
