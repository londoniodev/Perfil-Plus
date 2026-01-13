"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_BASE } from "@/lib/config";
import styles from "../ebook-form.module.css";

// SVG Icons
const IconBack = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></svg>;
const IconEdit = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>;
const IconLock = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>;
const IconEye = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>;
const IconImage = () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>;
const IconUpload = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>;
const IconSettings = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>;
const IconFile = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><polyline points="13 2 13 9 20 9" /></svg>;
const IconSave = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>;
const IconCheck = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>;

export default function EditEbookPage(props: { params: Promise<{ id: string }> }) {
    const params = use(props.params);
    const router = useRouter();
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
