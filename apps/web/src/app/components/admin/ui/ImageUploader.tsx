"use client";

import React, { useRef, useState } from 'react';

interface ImageUploaderProps {
    value: string | null;
    onChange: (url: string | null) => void;
    label?: string;
    folder?: string;
}

import { API_BASE } from "@/lib/config";
import styles from "@/app/styles/admin.module.css";
import { IconImage, IconTrash, IconUpload } from "@/app/components/ui/Icons";

export default function ImageUploader({
    value,
    onChange,
    label = "Imagen de portada",
    folder = "blog-covers"
}: ImageUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
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
            setError(`Formato no permitido. Solo se aceptan: ${allowedExtensions.join(', ').toUpperCase()}`);
            return;
        }

        // Validate file size (max 5MB)
        const maxSizeMB = 5;
        if (file.size > maxSizeMB * 1024 * 1024) {
            const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
            setError(`El archivo pesa ${fileSizeMB}MB. El tamaño máximo permitido es ${maxSizeMB}MB`);
            return;
        }

        setError(null);
        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', folder);

            const res = await fetch(`${API_BASE}/storage/upload/image`, {
                method: 'POST',
                credentials: 'include',
                body: formData,
            });

            if (!res.ok) {
                // Intentar parsear el error del backend
                let errorMessage = 'Error al subir imagen';
                try {
                    const errorData = await res.json();
                    if (errorData.message) {
                        // Parsear mensajes específicos del backend
                        if (errorData.message.includes('MaxFileSizeValidator') || errorData.message.includes('size')) {
                            errorMessage = `El archivo excede el tamaño máximo permitido (${maxSizeMB}MB)`;
                        } else if (errorData.message.includes('FileTypeValidator') || errorData.message.includes('type')) {
                            errorMessage = `Formato no permitido. Solo se aceptan: ${allowedExtensions.join(', ').toUpperCase()}`;
                        } else if (Array.isArray(errorData.message)) {
                            errorMessage = errorData.message[0];
                        } else {
                            errorMessage = errorData.message;
                        }
                    }
                } catch {
                    // Si no se puede parsear, usar mensaje genérico basado en status
                    if (res.status === 413) {
                        errorMessage = `El archivo excede el tamaño máximo permitido (${maxSizeMB}MB)`;
                    } else if (res.status === 400) {
                        errorMessage = 'Archivo inválido. Verifica el formato y tamaño';
                    } else if (res.status === 401 || res.status === 403) {
                        errorMessage = 'No tienes permisos para subir archivos';
                    }
                }
                throw new Error(errorMessage);
            }

            const data = await res.json();
            onChange(data.url);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al subir');
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
        <div className={styles.uploaderContainer}>
            <label className={styles.label}>
                {label}
            </label>

            {value ? (
                <div className={styles.previewContainer}>
                    <img
                        src={value}
                        alt="Preview"
                        className={styles.previewImage}
                    />
                    <button
                        type="button"
                        onClick={handleRemove}
                        className={styles.removeBtn}
                        title="Eliminar imagen"
                    >
                        <IconTrash size={16} />
                    </button>
                </div>
            ) : (
                <div
                    onClick={() => inputRef.current?.click()}
                    className={`${styles.uploadArea} ${uploading ? styles.uploadAreaUploading : ''}`}
                >
                    {uploading ? (
                        <div style={{ color: "var(--foreground-muted)" }}>
                            <IconUpload className={`animate-bounce ${styles.uploadIcon}`} />
                            <div>Subiendo...</div>
                        </div>
                    ) : (
                        <>
                            <IconImage className={styles.uploadIcon} size={48} strokeWidth={1} />
                            <p className={styles.uploadText}>
                                Haz clic para subir una imagen
                            </p>
                            <p className={styles.uploadSubtext}>
                                JPG, JPEG, PNG, GIF, WEBP, AVIF (max. 5MB)
                            </p>
                        </>
                    )}
                </div>
            )}

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: "none" }}
            />

            {error && (
                <p className={styles.errorText}>
                    {error}
                </p>
            )}
        </div>
    );
}
