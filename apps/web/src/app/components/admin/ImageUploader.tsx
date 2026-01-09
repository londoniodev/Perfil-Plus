"use client";

import React, { useRef, useState } from 'react';

interface ImageUploaderProps {
    value: string | null;
    onChange: (url: string | null) => void;
    label?: string;
    folder?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.mauromera.com/api";

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

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Solo se permiten imágenes');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('La imagen no debe superar 5MB');
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
                throw new Error('Error al subir imagen');
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
                                PNG, JPG, WEBP (max. 5MB)
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
