"use client";

import React, { useRef, useState } from 'react';
import { API_BASE, TENANT_ID } from "@/lib/config";
import { IconVideo, IconTrash, IconUpload } from "@mauromera/ui";
import { useToast } from "@mauromera/ui";
import { cn } from "@/lib/utils";
import { Button } from "@mauromera/ui";

interface VideoUploaderProps {
    value: string | null;
    onChange: (url: string | null) => void;
    label?: string;
    folder?: string;
    className?: string;
}

export default function VideoUploader({
    value,
    onChange,
    label = "Video de la clase",
    folder = "lms-videos",
    className
}: VideoUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const toast = useToast();
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Formatos permitidos
        const allowedFormats = ['video/mp4', 'video/webm', 'video/quicktime'];
        const allowedExtensions = ['mp4', 'webm', 'mov'];
        const fileExtension = file.name.split('.').pop()?.toLowerCase();

        if (!allowedFormats.includes(file.type) && !allowedExtensions.includes(fileExtension || '')) {
            toast.error(`Formato podría no ser compatible. Recomendado: MP4, WEBM, MOV`);
        }

        const maxSizeMB = 500;
        if (file.size > maxSizeMB * 1024 * 1024) {
            const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
            toast.error(`El archivo pesa ${fileSizeMB}MB. El tamaño máximo permitido es ${maxSizeMB}MB`);
            return;
        }

        setUploading(true);
        const progressInterval = setInterval(() => {
            setProgress(prev => (prev >= 90 ? 90 : prev + 5));
        }, 500);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', folder);

            const res = await fetch(`${API_BASE}/storage/upload/video`, {
                method: 'POST',
                headers: { 'x-tenant-id': TENANT_ID },
                credentials: 'include',
                body: formData,
            });

            clearInterval(progressInterval);
            setProgress(100);

            if (!res.ok) {
                let errorMessage = 'Error al subir video';
                try {
                    const errorData = await res.json();
                    if (errorData.message) errorMessage = errorData.message;
                } catch { }
                throw new Error(errorMessage);
            }

            const data = await res.json();
            onChange(data.url);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Error al subir');
            setProgress(0);
        } finally {
            setUploading(false);
            clearInterval(progressInterval);
        }
    };

    const handleRemove = () => {
        if (confirm("¿Estás seguro de quitar el video? Deberás subirlo de nuevo.")) {
            onChange(null);
            if (inputRef.current) {
                inputRef.current.value = '';
            }
            setProgress(0);
        }
    };

    return (
        <div className={cn("space-y-2", className)}>
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {label}
            </label>

            {value ? (
                <div className="relative rounded-md overflow-hidden border bg-black group max-h-[400px]">
                    <video
                        src={value}
                        controls
                        className="w-full h-full object-contain"
                        style={{ background: "#000" }}
                    />
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={handleRemove}
                            title="Eliminar video"
                        >
                            <IconTrash className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            ) : (
                <div
                    onClick={() => inputRef.current?.click()}
                    className={cn(
                        "flex flex-col items-center justify-center rounded-md border-2 border-dashed p-8 text-center cursor-pointer transition-colors hover:bg-muted/50 hover:border-primary/50",
                        uploading && "cursor-wait opacity-50"
                    )}
                >
                    {uploading ? (
                        <div className="w-full max-w-xs space-y-2">
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Subiendo video...</span>
                                <span>{progress}%</span>
                            </div>
                            <div className="h-2 w-full bg-secondary overflow-hidden rounded-full">
                                <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center text-muted-foreground">
                            <IconVideo className="h-10 w-10 mb-2" strokeWidth={1} />
                            <p className="text-sm font-medium text-foreground">
                                Clic para subir video
                            </p>
                            <p className="text-xs mt-1">
                                MP4, WEBM, MOV (max. 500MB)
                            </p>
                        </div>
                    )}
                </div>
            )}

            <input
                ref={inputRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                onChange={handleFileChange}
                className="hidden"
            />
        </div>
    );
}
