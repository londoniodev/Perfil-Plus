"use client";

import React, { useRef, useState } from 'react';
import { API_BASE, TENANT_ID } from "@/lib/config";
import { IconImage, IconTrash, IconUpload } from "@mauromera/ui";
import { useToast } from "@mauromera/ui";
import { cn } from "@/lib/utils";
import { Button } from "@mauromera/ui";

interface ImageUploaderProps {
    value: string | null;
    onChange: (url: string | null) => void;
    label?: string;
    folder?: string;
    className?: string;
}

export default function ImageUploader({
    value,
    onChange,
    label = "Imagen de portada",
    folder = "blog-covers",
    className
}: ImageUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const toast = useToast();
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Formatos permitidos
        const allowedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
        const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif'];
        const fileExtension = file.name.split('.').pop()?.toLowerCase();

        // Validate file type
        if (!allowedFormats.includes(file.type) && !allowedExtensions.includes(fileExtension || '')) {
            toast.error(`Formato no permitido. Solo se aceptan: ${allowedExtensions.join(', ').toUpperCase()}`);
            return;
        }

        // Validate file size (max 5MB)
        const maxSizeMB = 5;
        if (file.size > maxSizeMB * 1024 * 1024) {
            const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
            toast.error(`El archivo pesa ${fileSizeMB}MB. El tamaño máximo permitido es ${maxSizeMB}MB`);
            return;
        }

        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', folder);

            const res = await fetch(`${API_BASE}/storage/upload/image`, {
                method: 'POST',
                headers: { 'x-tenant-id': TENANT_ID },
                credentials: 'include',
                body: formData,
            });

            if (!res.ok) {
                let errorMessage = 'Error al subir imagen';
                try {
                    const errorData = await res.json();
                    if (errorData.message) {
                        if (Array.isArray(errorData.message)) errorMessage = errorData.message[0];
                        else errorMessage = errorData.message;
                    }
                } catch {
                    if (res.status === 413) errorMessage = `El archivo excede el tamaño máximo permitido`;
                }
                throw new Error(errorMessage);
            }

            const data = await res.json();
            onChange(data.url);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Error al subir');
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = () => {
        onChange(null);
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    return (
        <div className={cn("space-y-2", className)}>
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {label}
            </label>

            {value ? (
                <div className="relative rounded-md overflow-hidden border bg-black group max-h-[300px] w-full aspect-video">
                    <img
                        src={value}
                        alt="Preview"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={handleRemove}
                            title="Eliminar imagen"
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
                        <div className="flex flex-col items-center text-muted-foreground">
                            <IconUpload className="h-10 w-10 animate-bounce mb-2" />
                            <span className="text-sm">Subiendo...</span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center text-muted-foreground">
                            <IconImage className="h-10 w-10 mb-2" strokeWidth={1} />
                            <p className="text-sm font-medium text-foreground">
                                Haz clic para subir una imagen
                            </p>
                            <p className="text-xs mt-1">
                                JPG, PNG, WEBP, AVIF (max. 5MB)
                            </p>
                        </div>
                    )}
                </div>
            )}

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
            />
        </div>
    );
}
