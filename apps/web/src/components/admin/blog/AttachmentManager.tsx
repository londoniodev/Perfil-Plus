"use client";

import React, { useState, useRef } from 'react';
import { API_BASE, TENANT_ID } from "@/lib/config";
import {
    IconUpload,
    IconDownload,
    IconTrash,
    IconFile,
    IconImage,
    IconDocument,
    IconLock
} from "@mauromera/ui";
import { useToast } from "@mauromera/ui";
import { Button } from "@mauromera/ui";

import { Attachment } from "@/types/blog";

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
    const baseClass = "w-10 h-10 flex items-center justify-center rounded-lg";
    if (fileType.includes('pdf')) {
        return <div className={`${baseClass} bg-red-100 text-red-600`}><IconDocument size={20} /></div>;
    }
    if (fileType.includes('image')) {
        return <div className={`${baseClass} bg-blue-100 text-blue-600`}><IconImage size={20} /></div>;
    }
    return <div className={`${baseClass} bg-gray-100 text-gray-600`}><IconFile size={20} /></div>;
}

export default function AttachmentManager({ postId, attachments, onUpdate, isPremium }: AttachmentManagerProps) {
    const [uploading, setUploading] = useState(false);
    const toast = useToast();
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        // Formatos permitidos
        const allowedFormats = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'avif', 'mp4', 'webm'];
        const maxSizeMB = 10;
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
                    headers: { 'x-tenant-id': TENANT_ID },
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
                    headers: {
                        'Content-Type': 'application/json',
                        'x-tenant-id': TENANT_ID,
                    },
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
            toast.error(err instanceof Error ? err.message : 'Error al subir archivos');
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
                headers: { 'x-tenant-id': TENANT_ID },
                credentials: 'include',
            });

            if (!res.ok) throw new Error('Error al eliminar');
            onUpdate();
        } catch (err) {
            toast.error('Error al eliminar el archivo');
        }
    };

    return (
        <div className="border border-border rounded-xl p-6 bg-card">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    Archivos Adjuntos
                </h3>
                <Button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={uploading}
                    size="sm"
                >
                    <IconUpload className="mr-2 h-4 w-4" />
                    {uploading ? 'Subiendo...' : 'Subir archivo'}
                </Button>
            </div>

            <input
                ref={inputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.webp"
                onChange={handleFileChange}
                style={{ display: "none" }}
            />

            {isPremium && (
                <div className="bg-amber-500/10 text-amber-600 border border-amber-500/20 px-4 py-3 rounded-lg mb-4 text-sm flex items-center gap-2">
                    <IconLock className="h-4 w-4" />
                    Los archivos se guardarán en bucket privado (solo para suscriptores)
                </div>
            )}

            {attachments.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-border rounded-lg bg-muted/20">
                    <div className="mx-auto w-12 h-12 text-muted-foreground/50 mb-3 flex items-center justify-center">
                        <IconFile className="w-8 h-8" />
                    </div>
                    <p className="text-muted-foreground text-sm">
                        No hay archivos adjuntos
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {attachments.map((attachment) => (
                        <div key={attachment.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors border border-border/50">
                            <div className="flex items-center gap-4">
                                {getFileIcon(attachment.fileType)}
                                <div>
                                    <p className="text-sm font-medium text-foreground truncate max-w-[200px] sm:max-w-[300px]">
                                        {attachment.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatFileSize(attachment.fileSize)}
                                        {!attachment.isPublic && " • Privado"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button
                                    asChild
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                                >
                                    <a
                                        href={attachment.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        title="Descargar"
                                    >
                                        <IconDownload size={16} />
                                    </a>
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDelete(attachment)}
                                    className="h-8 w-8 text-muted-foreground hover:text-error hover:bg-error/10"
                                    title="Eliminar"
                                >
                                    <IconTrash size={16} />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
