"use client";

import React, { useState, useRef } from 'react';

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

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.mauromera.com/api";

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function getFileIcon(fileType: string): React.ReactNode {
    if (fileType.includes('pdf')) {
        return (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
            </svg>
        );
    }
    if (fileType.includes('image')) {
        return (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
            </svg>
        );
    }
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--foreground-muted)" strokeWidth="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
        </svg>
    );
}

export default function AttachmentManager({ postId, attachments, onUpdate, isPremium }: AttachmentManagerProps) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setError(null);
        setUploading(true);

        try {
            for (const file of Array.from(files)) {
                // Validate file size (max 10MB)
                if (file.size > 10 * 1024 * 1024) {
                    throw new Error(`${file.name}: El archivo no debe superar 10MB`);
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
                    throw new Error(`Error al subir ${file.name}`);
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
                    throw new Error(`Error al registrar ${file.name}`);
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
        <div style={{
            padding: "1rem",
            background: "var(--card-bg)",
            border: "1px solid var(--border)",
            borderRadius: "0.5rem"
        }}>
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem"
            }}>
                <h3 style={{
                    fontSize: "1rem",
                    fontWeight: 600,
                    color: "var(--foreground)",
                    margin: 0
                }}>
                    Archivos Adjuntos
                </h3>
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={uploading}
                    style={{
                        padding: "0.5rem 1rem",
                        background: uploading ? "var(--foreground-muted)" : "var(--accent)",
                        color: "white",
                        border: "none",
                        borderRadius: "0.375rem",
                        cursor: uploading ? "wait" : "pointer",
                        fontSize: "0.875rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem"
                    }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
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
                    marginBottom: "1rem"
                }}>
                    {error}
                </div>
            )}

            {isPremium && (
                <div style={{
                    padding: "0.5rem 0.75rem",
                    background: "rgba(139, 92, 246, 0.1)",
                    borderRadius: "0.375rem",
                    color: "#8b5cf6",
                    fontSize: "0.75rem",
                    marginBottom: "1rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem"
                }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    Los archivos se guardarán en bucket privado (solo para suscriptores)
                </div>
            )}

            {attachments.length === 0 ? (
                <p style={{
                    color: "var(--foreground-muted)",
                    fontSize: "0.875rem",
                    textAlign: "center",
                    padding: "1rem 0"
                }}>
                    No hay archivos adjuntos
                </p>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {attachments.map((attachment) => (
                        <div
                            key={attachment.id}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.75rem",
                                padding: "0.75rem",
                                background: "var(--background)",
                                borderRadius: "0.375rem",
                                border: "1px solid var(--border)"
                            }}
                        >
                            {getFileIcon(attachment.fileType)}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{
                                    margin: 0,
                                    fontSize: "0.875rem",
                                    color: "var(--foreground)",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis"
                                }}>
                                    {attachment.name}
                                </p>
                                <p style={{
                                    margin: 0,
                                    fontSize: "0.75rem",
                                    color: "var(--foreground-muted)"
                                }}>
                                    {formatFileSize(attachment.fileSize)}
                                    {!attachment.isPublic && " • Privado"}
                                </p>
                            </div>
                            <a
                                href={attachment.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    padding: "0.375rem",
                                    color: "var(--foreground-muted)",
                                    borderRadius: "0.25rem"
                                }}
                                title="Descargar"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="7 10 12 15 17 10" />
                                    <line x1="12" y1="15" x2="12" y2="3" />
                                </svg>
                            </a>
                            <button
                                type="button"
                                onClick={() => handleDelete(attachment)}
                                style={{
                                    padding: "0.375rem",
                                    background: "transparent",
                                    border: "none",
                                    color: "#ef4444",
                                    cursor: "pointer",
                                    borderRadius: "0.25rem"
                                }}
                                title="Eliminar"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
