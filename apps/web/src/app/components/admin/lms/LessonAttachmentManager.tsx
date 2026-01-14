"use client";

import React, { useState, useRef } from 'react';
import { API_BASE } from "@/lib/config";
import styles from '@/app/styles/lms.module.css';
import {
    IconUpload,
    IconDownload,
    IconTrash,
    IconFile,
    IconImage,
    IconDocument
} from "@/app/components/ui/Icons";

interface Attachment {
    id: string;
    lessonId: string;
    name: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
    createdAt: string;
}

interface LessonAttachmentManagerProps {
    lessonId: string;
    attachments: Attachment[];
    onUpdate: () => void;
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

export default function LessonAttachmentManager({ lessonId, attachments, onUpdate }: LessonAttachmentManagerProps) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        // Formatos permitidos
        const allowedFormats = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'png', 'jpg', 'jpeg', 'zip', 'rar'];
        const maxSizeMB = 50; // Mayor tamaño para adjuntos de lecciones

        setError(null);
        setUploading(true);

        try {
            for (const file of Array.from(files)) {
                const fileExtension = file.name.split('.').pop()?.toLowerCase();

                // Validar formato
                if (!fileExtension || !allowedFormats.includes(fileExtension)) {
                    throw new Error(`"${file.name}": Formato no permitido. Solo se aceptan: ${allowedFormats.join(', ').toUpperCase()}`);
                }

                // Validate file size
                if (file.size > maxSizeMB * 1024 * 1024) {
                    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
                    throw new Error(`"${file.name}": El archivo pesa ${fileSizeMB}MB. El tamaño máximo es ${maxSizeMB}MB`);
                }

                // Bucket folder
                const folder = 'lms-attachments';

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
                    let errorMessage = `Error al subir "${file.name}"`;
                    try {
                        const errorData = await uploadRes.json();
                        if (errorData.message) errorMessage = errorData.message;
                    } catch { }
                    throw new Error(errorMessage);
                }

                const uploadData = await uploadRes.json();

                // Create attachment record
                const attachRes = await fetch(`${API_BASE}/admin/lms/lessons/${lessonId}/attachments`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        name: file.name,
                        fileUrl: uploadData.url,
                        fileType: fileExtension, // Guardar extensión como tipo para simplificar
                        fileSize: file.size,
                    }),
                });

                if (!attachRes.ok) {
                    throw new Error(`Error al registrar "${file.name}" en la lección`);
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
            const res = await fetch(`${API_BASE}/admin/lms/attachments/${attachment.id}`, {
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
                    Material Complementario
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
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.zip,.rar"
                onChange={handleFileChange}
                style={{ display: "none" }}
            />

            {error && (
                <div className={styles.error} style={{ fontSize: "0.875rem", padding: "0.75rem", marginBottom: "1rem" }}>
                    {error}
                </div>
            )}

            {attachments.length === 0 ? (
                <p className={styles.emptyText} style={{ textAlign: "center", fontSize: "0.875rem" }}>
                    No hay material complementario
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
