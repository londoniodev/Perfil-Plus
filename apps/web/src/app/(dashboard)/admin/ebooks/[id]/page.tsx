"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_BASE } from "@/lib/config";
import styles from "@/styles/ebook-form.module.css";

import { IconBack, IconEdit, IconLock, IconEye, IconImage, IconUpload, IconSettings, IconFile, IconSave, IconCheck } from "@/components/ui/Icons";
import { useToast } from "@/components/ui/Toast";

export default function EditEbookPage(props: { params: Promise<{ id: string }> }) {
    const params = use(props.params);
    const router = useRouter();
    const toast = useToast();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [published, setPublished] = useState(false);
    const [currentCover, setCurrentCover] = useState("");
    const [hasFullFile, setHasFullFile] = useState(false);
    const [hasPreviewFile, setHasPreviewFile] = useState(false);

    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [fullFile, setFullFile] = useState<File | null>(null);
    const [previewFile, setPreviewFile] = useState<File | null>(null);

    useEffect(() => { fetchEbook(); }, []);

    const fetchEbook = async () => {
        try {
            const res = await fetch(`${API_BASE}/admin/ebooks/${params.id}`, { credentials: "include" });
            if (!res.ok) throw new Error("Error");
            const data = await res.json();
            setTitle(data.title);
            setDescription(data.description);
            setPrice(data.price);
            setPublished(data.published);
            setCurrentCover(data.coverImage);
            setHasFullFile(!!data.fileUrl);
            setHasPreviewFile(!!data.previewUrl);
        } catch {
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
                const res = await fetch(`${API_BASE}/storage/upload/image`, { method: "POST", credentials: "include", body: formData });
                if (res.ok) coverUrl = (await res.json()).url;
            }

            let fileUrl = undefined;
            if (fullFile) {
                const formData = new FormData();
                formData.append("file", fullFile);
                const res = await fetch(`${API_BASE}/storage/upload/ebook`, { method: "POST", credentials: "include", body: formData });
                if (res.ok) fileUrl = (await res.json()).url;
            }

            let previewUrl = undefined;
            if (previewFile) {
                const formData = new FormData();
                formData.append("file", previewFile);
                const res = await fetch(`${API_BASE}/storage/upload?folder=ebook-previews`, { method: "POST", credentials: "include", body: formData });
                if (res.ok) previewUrl = (await res.json()).url;
            }

            const res = await fetch(`${API_BASE}/admin/ebooks/${params.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    title, description, price: parseFloat(price), published,
                    ...(coverUrl && { coverImage: coverUrl }),
                    ...(fileUrl && { fileUrl }),
                    ...(previewUrl && { previewUrl }),
                }),
            });

            if (!res.ok) throw new Error("Error");
            toast.success("E-book actualizado correctamente");
            router.push("/admin/ebooks");
            router.refresh();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Error al actualizar E-book");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className={styles.loading}>Cargando...</div>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Editar E-book</h1>
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
                            <label>Título *</label>
                            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
                        </div>
                        <div className={styles.field}>
                            <label>Descripción *</label>
                            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} required />
                        </div>
                    </div>

                    <div className={styles.card}>
                        <h2 className={styles.cardTitle}><IconFile /> Archivos</h2>
                        <div className={styles.filesGrid}>
                            <label className={`${styles.fileBox} ${(fullFile || hasFullFile) ? styles.fileBoxActive : ''}`}>
                                <input type="file" accept=".pdf,.epub" onChange={(e) => setFullFile(e.target.files?.[0] || null)} hidden />
                                <div className={styles.fileIcon}><IconLock /></div>
                                <div className={styles.fileName}>{fullFile ? fullFile.name : (hasFullFile ? "PDF Cargado" : "PDF Completo *")}</div>
                                <div className={styles.fileHint}>Click para reemplazar</div>
                                <div className={styles.fileMeta}>PDF, EPUB • Máx 50MB</div>
                            </label>

                            <label className={`${styles.fileBox} ${(previewFile || hasPreviewFile) ? styles.fileBoxActive : ''}`}>
                                <input type="file" accept=".pdf" onChange={(e) => setPreviewFile(e.target.files?.[0] || null)} hidden />
                                <div className={styles.fileIcon}><IconEye /></div>
                                <div className={styles.fileName}>{previewFile ? previewFile.name : (hasPreviewFile ? "Preview Cargado" : "Vista Previa")}</div>
                                <div className={styles.fileHint}>Click para reemplazar</div>
                                <div className={styles.fileMeta}>PDF • Máx 10MB</div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* RIGHT */}
                <div className={styles.rightColumn}>
                    <div className={styles.card}>
                        <h2 className={styles.cardTitle}><IconImage /> Portada</h2>
                        <label className={`${styles.coverBox} ${(coverFile || currentCover) ? styles.coverBoxActive : ''}`}>
                            <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} hidden />
                            {(coverFile || currentCover) ? (
                                <img src={coverFile ? URL.createObjectURL(coverFile) : currentCover} alt="Preview" className={styles.coverPreview} />
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
                                <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
                            </div>
                        </div>

                        <label className={styles.toggleRow}>
                            <div>
                                <div className={styles.toggleLabel}>Estado</div>
                                <div className={styles.toggleHint}>{published ? "Visible en tienda" : "Borrador"}</div>
                            </div>
                            <div className={`${styles.toggle} ${published ? styles.toggleOn : ''}`} onClick={() => setPublished(!published)}>
                                <div className={styles.toggleCircle}>{published && <IconCheck />}</div>
                            </div>
                        </label>
                    </div>

                    <button type="submit" disabled={submitting} className={styles.submitBtn}>
                        <IconSave /> {submitting ? "Guardando..." : "Guardar Cambios"}
                    </button>
                </div>
            </form>
        </div>
    );
}
