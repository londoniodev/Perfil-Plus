"use client";

import React, { useState, useRef } from 'react';
import { API_BASE, TENANT_ID } from "@/lib/config";
import {
    IconUpload,
    IconDownload,
    IconTrash,
    IconFile,
    IconImage,
    IconDocument
} from "@alvarosky/ui";
import { useToast } from "@alvarosky/ui";
import { Button } from "@alvarosky/ui";
import { Card, CardHeader, CardTitle, CardContent } from "@alvarosky/ui";

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
        return <div className="text-red-500"><IconDocument size={24} /></div>;
    }
    if (fileType.includes('image')) {
        return <div className="text-blue-500"><IconImage size={24} /></div>;
    }
    return <div className="text-muted-foreground"><IconFile size={24} /></div>;
}

export default function LessonAttachmentManager({ lessonId, attachments, onUpdate }: LessonAttachmentManagerProps) {
    const [uploading, setUploading] = useState(false);
    const toast = useToast();
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        // Formatos permitidos
        const allowedFormats = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'png', 'jpg', 'jpeg', 'zip', 'rar'];
        const maxSizeMB = 50; // Mayor tamaño para adjuntos de lecciones

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
                    headers: { 'x-tenant-id': TENANT_ID },
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
                    headers: {
                        'Content-Type': 'application/json',
                        'x-tenant-id': TENANT_ID,
                    },
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
            toast.error(err instanceof Error ? err.message : 'Error al subir archivos');
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
        <Card className="mt-6 border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-base font-semibold">
                    Material Complementario
                </CardTitle>
                <Button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={uploading}
                    size="sm"
                    className="gap-2"
                >
                    <IconUpload size={16} />
                    {uploading ? 'Subiendo...' : 'Subir archivo'}
                </Button>
            </CardHeader>
            <CardContent>
                <input
                    ref={inputRef}
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.zip,.rar"
                    onChange={handleFileChange}
                    className="hidden"
                />

                {attachments.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground py-8 border border-dashed rounded-lg bg-muted/20">
                        No hay material complementario
                    </p>
                ) : (
                    <div className="flex flex-col gap-2">
                        {attachments.map((attachment) => (
                            <div key={attachment.id} className="flex items-center gap-3 p-3 bg-background border rounded-lg hover:border-primary/50 transition-colors group">
                                {getFileIcon(attachment.fileType)}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">
                                        {attachment.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatFileSize(attachment.fileSize)}
                                    </p>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        asChild
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        title="Descargar"
                                    >
                                        <a
                                            href={attachment.fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <IconDownload size={16} />
                                        </a>
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(attachment)}
                                        className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                        title="Eliminar"
                                    >
                                        <IconTrash size={16} />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

