"use client";

import React, { useRef, useState } from 'react';

interface ImageUploaderProps {
    value: string | null;
    onChange: (url: string | null) => void;
    label?: string;
    folder?: string;
}

import { API_BASE } from "@/lib/config";

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
        <div>
            <label style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "var(--foreground)",
                marginBottom: "0.5rem"
            }}>
                {label}
            </label>

            {value ? (
                <div style={{
                    position: "relative",
                    borderRadius: "0.5rem",
                    overflow: "hidden",
                    border: "1px solid var(--border)"
                }}>
                    <img
                        src={value}
                        alt="Preview"
                        style={{
                            width: "100%",
                            height: "200px",
                            objectFit: "cover"
                        }}
                    />
                    <button
                        type="button"
                        onClick={handleRemove}
                        style={{
                            position: "absolute",
                            top: "0.5rem",
                            right: "0.5rem",
                            padding: "0.5rem",
                            background: "rgba(0, 0, 0, 0.7)",
                            color: "white",
                            border: "none",
                            borderRadius: "0.375rem",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>
            ) : (
                <div
                    onClick={() => inputRef.current?.click()}
                    style={{
                        padding: "2rem",
                        border: "2px dashed var(--border)",
                        borderRadius: "0.5rem",
                        textAlign: "center",
                        cursor: uploading ? "wait" : "pointer",
                        background: "var(--card-bg)",
                        transition: "border-color 0.2s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                    {uploading ? (
                        <div style={{ color: "var(--foreground-muted)" }}>
                            Subiendo...
                        </div>
                    ) : (
                        <>
                            <svg
                                width="48"
                                height="48"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="var(--foreground-muted)"
                                strokeWidth="1.5"
                                style={{ margin: "0 auto 0.5rem" }}
                            >
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                <circle cx="8.5" cy="8.5" r="1.5" />
                                <polyline points="21 15 16 10 5 21" />
                            </svg>
                            <p style={{ color: "var(--foreground-muted)", margin: 0 }}>
                                Haz clic para subir una imagen
                            </p>
                            <p style={{
                                color: "var(--foreground-muted)",
                                fontSize: "0.75rem",
                                marginTop: "0.25rem"
                            }}>
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
                <p style={{
                    color: "#ef4444",
                    fontSize: "0.75rem",
                    marginTop: "0.5rem"
                }}>
                    {error}
                </p>
            )}
        </div>
    );
}
