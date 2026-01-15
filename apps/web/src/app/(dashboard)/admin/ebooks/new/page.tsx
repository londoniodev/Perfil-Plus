"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_BASE } from "@/lib/config";
import styles from "@/styles/ebook-form.module.css";

import { IconBack, IconEdit, IconLock, IconEye, IconImage, IconUpload, IconSettings, IconFile, IconCheck, IconRocket } from "@/components/ui/Icons";
import { useToast } from "@/components/ui/Toast";


export default function NewEbookPage() {
    const router = useRouter();
    const toast = useToast();
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
            toast.error("Por favor completa todos los campos requeridos");
            return;
        }

        try {
            setSubmitting(true);

            const coverFormData = new FormData();
            coverFormData.append("file", coverFile);
            const coverRes = await fetch(`${API_BASE}/storage/upload/image`, { method: "POST", credentials: "include", body: coverFormData });
            if (!coverRes.ok) throw new Error("Error al subir imagen");
            const coverData = await coverRes.json();

            const fullFormData = new FormData();
            fullFormData.append("file", fullFile);
            const fullRes = await fetch(`${API_BASE}/storage/upload/ebook`, { method: "POST", credentials: "include", body: fullFormData });
            if (!fullRes.ok) throw new Error("Error al subir eBook");
            const fullData = await fullRes.json();

            let previewUrl = undefined;
            if (previewFile) {
                const previewFormData = new FormData();
                previewFormData.append("file", previewFile);
                const previewRes = await fetch(`${API_BASE}/storage/upload?folder=ebook-previews`, { method: "POST", credentials: "include", body: previewFormData });
                if (previewRes.ok) previewUrl = (await previewRes.json()).url;
            }

            const res = await fetch(`${API_BASE}/admin/ebooks`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ title, description, price: parseFloat(price), published, coverImage: coverData.url, fileUrl: fullData.url, previewUrl }),
            });

            if (!res.ok) throw new Error("Error al crear eBook");
            toast.success("E-book creado correctamente");
            router.push("/admin/ebooks");
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Error al crear E-book");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Nuevo E-book</h1>
                <Link href="/admin/ebooks" className={styles.backBtn}>
                    <IconBack /> Cancelar
                </Link>
            </div>

            <form onSubmit={handleSubmit} className={styles.grid}>
                {/* LEFT */}
                <div className={styles.leftColumn}>
                    <div className={styles.card}>
                        <h2 className={styles.cardTitle}><IconEdit /> Información</h2>
                        <div className={styles.field}>
                            <label>Título del Libro *</label>
                            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej. Liderazgo Consciente" required />
                        </div>
                        <div className={styles.field}>
                            <label>Descripción *</label>
                            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Escribe una descripción atractiva..." rows={5} required />
                        </div>
                    </div>

                    <div className={styles.card}>
                        <h2 className={styles.cardTitle}><IconFile /> Archivos</h2>
                        <div className={styles.filesGrid}>
                            <label className={`${styles.fileBox} ${fullFile ? styles.fileBoxActive : ''}`}>
                                <input type="file" accept=".pdf,.epub" onChange={(e) => setFullFile(e.target.files?.[0] || null)} hidden />
                                <div className={styles.fileIcon}><IconLock /></div>
                                <div className={styles.fileName}>{fullFile ? fullFile.name : "PDF Completo *"}</div>
                                <div className={styles.fileHint}>Privado - Solo tras compra</div>
                                <div className={styles.fileMeta}>PDF, EPUB • Máx 50MB</div>
                            </label>

                            <label className={`${styles.fileBox} ${previewFile ? styles.fileBoxActive : ''}`}>
                                <input type="file" accept=".pdf" onChange={(e) => setPreviewFile(e.target.files?.[0] || null)} hidden />
                                <div className={styles.fileIcon}><IconEye /></div>
                                <div className={styles.fileName}>{previewFile ? previewFile.name : "Vista Previa"}</div>
                                <div className={styles.fileHint}>Público - Muestra gratuita</div>
                                <div className={styles.fileMeta}>PDF • Máx 10MB</div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* RIGHT */}
                <div className={styles.rightColumn}>
                    <div className={styles.card}>
                        <h2 className={styles.cardTitle}><IconImage /> Portada</h2>
                        <label className={`${styles.coverBox} ${coverFile ? styles.coverBoxActive : ''}`}>
                            <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} hidden />
                            {coverFile ? (
                                <img src={URL.createObjectURL(coverFile)} alt="Preview" className={styles.coverPreview} />
                            ) : (
                                <>
                                    <div className={styles.coverIcon}><IconUpload /></div>
                                    <div className={styles.coverText}>Click para subir</div>
                                    <div className={styles.fileMeta}>JPG, PNG, WebP • Máx 10MB</div>
                                </>
                            )}
                        </label>
                    </div>

                    <div className={styles.card}>
                        <h2 className={styles.cardTitle}><IconSettings /> Configuración</h2>
                        <div className={styles.field}>
                            <label>Precio (USD) *</label>
                            <div className={styles.priceInput}>
                                <span>$</span>
                                <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" min="0" step="1000" required />
                            </div>
                        </div>

                        <label className={styles.toggleRow}>
                            <div>
                                <div className={styles.toggleLabel}>Publicar</div>
                                <div className={styles.toggleHint}>{published ? "Visible en tienda" : "Guardado como borrador"}</div>
                            </div>
                            <div className={`${styles.toggle} ${published ? styles.toggleOn : ''}`} onClick={() => setPublished(!published)}>
                                <div className={styles.toggleCircle}>{published && <IconCheck />}</div>
                            </div>
                        </label>
                    </div>

                    <button type="submit" disabled={submitting} className={styles.submitBtn}>
                        <IconRocket /> {submitting ? "Creando..." : "Crear E-book"}
                    </button>
                </div>
            </form>
        </div>
    );
}
