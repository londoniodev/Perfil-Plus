"use client";

import React, { useState, useRef } from 'react';
import { API_BASE } from "@/lib/config";
import styles from '@/app/styles/blog.module.css';
import {
    IconUpload,
    IconDownload,
    IconTrash,
    IconFile,
    IconImage,
    IconDocument,
    IconLock
} from "@/app/components/ui/Icons";

interface Attachment {
    id: string;
    name: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
    isPublic: boolean;
}

interface AttachmentManagerProps {
    postId: string;
    attachments: Attachment[];
    onUpdate: () => void;
    isPremium: boolean;
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function getFileIcon(fileType: string): React.ReactNode {
    if (fileType.includes('pdf')) {
        return <div className={`${styles.fileIcon} ${styles.pdf}`}><IconDocument size={24} /></div>;
    }
    if (fileType.includes('image')) {
        return <div className={`${styles.fileIcon} ${styles.image}`}><IconImage size={24} /></div>;
    }
    return <div className={styles.fileIcon}><IconFile size={24} /></div>;
}

export default function AttachmentManager({ postId, attachments, onUpdate, isPremium }: AttachmentManagerProps) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        // Formatos permitidos
        const allowedFormats = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'avif', 'mp4', 'webm'];
        const maxSizeMB = 10;

        setError(null);
        setUploading(true);

        try {
            for (const file of Array.from(files)) {
                const fileExtension = file.name.split('.').pop()?.toLowerCase();

                // Validar formato
                if (!fileExtension || !allowedFormats.includes(fileExtension)) {
                    throw new Error(`"${file.name}": Formato no permitido. Solo se aceptan: ${allowedFormats.join(', ').toUpperCase()}`);
                }

                // Validate file size (max 10MB)
                if (file.size > maxSizeMB * 1024 * 1024) {
                    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
                    throw new Error(`"${file.name}": El archivo pesa ${fileSizeMB}MB. El tamaño máximo es ${maxSizeMB}MB`);
                }

                // Determine bucket based on premium status
                const folder = isPremium ? 'blog-attachments-private' : 'blog-attachments';

                // Upload file to storage
                const formData = new FormData();
                formData.append('file', file);
                formData.append('folder', folder);

                const uploadRes = await fetch(`${API_BASE}/storage/upload`, {
                    method: 'POST',
                    credentials: 'include',
                    body: formData,
                });

                if (!uploadRes.ok) {
                    // Intentar parsear el error del backend
                    let errorMessage = `Error al subir "${file.name}"`;
                    try {
                        const errorData = await uploadRes.json();
                        if (errorData.message) {
                            if (errorData.message.includes('MaxFileSizeValidator') || errorData.message.includes('size')) {
                                errorMessage = `"${file.name}": El archivo excede el tamaño máximo (${maxSizeMB}MB)`;
                            } else if (errorData.message.includes('FileTypeValidator') || errorData.message.includes('type')) {
                                errorMessage = `"${file.name}": Formato no permitido`;
                            } else if (typeof errorData.message === 'string') {
                                errorMessage = errorData.message;
                            }
                        }
                    } catch {
                        if (uploadRes.status === 413) {
                            errorMessage = `"${file.name}": El archivo excede el tamaño máximo (${maxSizeMB}MB)`;
                        } else if (uploadRes.status === 401 || uploadRes.status === 403) {
                            errorMessage = 'No tienes permisos para subir archivos';
                        }
                    }
                    throw new Error(errorMessage);
                }

                const uploadData = await uploadRes.json();

                // Create attachment record
                const attachRes = await fetch(`${API_BASE}/admin/blog/posts/${postId}/attachments`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        name: file.name,
                        fileUrl: uploadData.url,
                        fileType: file.type,
                        fileSize: file.size,
                        isPublic: !isPremium,
                    }),
                });

                if (!attachRes.ok) {
                    throw new Error(`Error al registrar "${file.name}" en el post`);
                }
            }

            onUpdate();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al subir archivos');
        } finally {
            setUploading(false);
            if (inputRef.current) inputRef.current.value = '';
        }
    };

    const handleDelete = async (attachment: Attachment) => {
        if (!confirm(`¿Eliminar "${attachment.name}"?`)) return;

        try {
            const res = await fetch(`${API_BASE}/admin/blog/attachments/${attachment.id}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (!res.ok) throw new Error('Error al eliminar');
            onUpdate();
        } catch (err) {
            setError('Error al eliminar el archivo');
        }
    };

    return (
        <div className={styles.attachmentManager}>
            <div className={styles.uploadHeader}>
                <h3 className={styles.uploadTitle}>
                    Archivos Adjuntos
                </h3>
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={uploading}
                    className={styles.uploadBtn}
                >
                    <IconUpload size={16} />
                    {uploading ? 'Subiendo...' : 'Subir archivo'}
                </button>
            </div>

            <input
                ref={inputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.webp"
                onChange={handleFileChange}
                style={{ display: "none" }}
            />

            {error && (
                <div style={{
                    padding: "0.75rem",
                    background: "rgba(239, 68, 68, 0.1)",
                    borderRadius: "0.375rem",
                    color: "#ef4444",
                    fontSize: "0.875rem",
                    marginBottom: "1rem",
                    border: "1px solid #ef4444"
                }}>
                    {error}
                </div>
            )}

            {isPremium && (
                <div className={styles.premiumTag}>
                    <IconLock size={16} />
                    Los archivos se guardarán en bucket privado (solo para suscriptores)
                </div>
            )}

            {attachments.length === 0 ? (
                <p className={styles.emptyText}>
                    No hay archivos adjuntos
                </p>
            ) : (
                <div className={styles.attachmentList}>
                    {attachments.map((attachment) => (
                        <div key={attachment.id} className={styles.attachmentItem}>
                            {getFileIcon(attachment.fileType)}
                            <div className={styles.attachmentInfo}>
                                <p className={styles.attachmentName}>
                                    {attachment.name}
                                </p>
                                <p className={styles.attachmentSize}>
                                    {formatFileSize(attachment.fileSize)}
                                    {!attachment.isPublic && " • Privado"}
                                </p>
                            </div>
                            <a
                                href={attachment.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.actionBtn}
                                title="Descargar"
                            >
                                <IconDownload size={16} />
                            </a>
                            <button
                                type="button"
                                onClick={() => handleDelete(attachment)}
                                className={`${styles.actionBtn} ${styles.danger}`}
                                title="Eliminar"
                            >
                                <IconTrash size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
