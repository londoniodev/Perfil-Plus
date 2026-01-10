"use client";

import React, { useRef, useState } from 'react';
import { API_BASE } from "@/lib/config";

interface VideoUploaderProps {
    value: string | null;
    onChange: (url: string | null) => void;
    label?: string;
    folder?: string;
}

export default function VideoUploader({
    value,
    onChange,
    label = "Video de la clase",
    folder = "lms-videos"
}: VideoUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0); // Para futuro soporte de progreso
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Formatos permitidos
        const allowedFormats = ['video/mp4', 'video/webm', 'video/quicktime'];
        const allowedExtensions = ['mp4', 'webm', 'mov'];
        const fileExtension = file.name.split('.').pop()?.toLowerCase();

        // Validación laxa de tipo (algunos navegadores no detectan bien mime types de videos)
        if (!allowedFormats.includes(file.type) && !allowedExtensions.includes(fileExtension || '')) {
            setError(`Formato podría no ser compatible. Recomendado: MP4, WEBM, MOV`);
        }

        // Validate file size (max 500MB)
        const maxSizeMB = 500;
        if (file.size > maxSizeMB * 1024 * 1024) {
            const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
            setError(`El archivo pesa ${fileSizeMB}MB. El tamaño máximo permitido es ${maxSizeMB}MB`);
            return;
        }

        setError(null);
        setUploading(true);
        // Simular progreso incierto
        const progressInterval = setInterval(() => {
            setProgress(prev => (prev >= 90 ? 90 : prev + 5));
        }, 500);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', folder); // Aunque storage.controller ignora esto para videos y usa 'videos' folder fixed

            const res = await fetch(`${API_BASE}/storage/upload/video`, {
                method: 'POST',
                credentials: 'include',
                body: formData,
            });

            clearInterval(progressInterval);
            setProgress(100);

            if (!res.ok) {
                let errorMessage = 'Error al subir video';
                try {
                    const errorData = await res.json();
                    errorMessage = errorData.message || errorMessage;
                } catch { }
                throw new Error(errorMessage);
            }

            const data = await res.json();
            onChange(data.url);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al subir');
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
                    border: "1px solid var(--border)",
                    background: "#000"
                }}>
                    <video
                        src={value}
                        controls
                        style={{
                            width: "100%",
                            maxHeight: "400px",
                            display: "block"
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
                            background: "rgba(239, 68, 68, 0.9)",
                            color: "white",
                            border: "none",
                            borderRadius: "0.375rem",
                            cursor: "pointer",
                            zIndex: 10
                        }}
                        title="Eliminar video"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            ) : (
                <div
                    onClick={() => inputRef.current?.click()}
                    style={{
                        padding: "3rem 2rem",
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
                            <div style={{ marginBottom: "0.5rem" }}>Subiendo video... {progress}%</div>
                            <div style={{ width: "100%", height: "4px", background: "var(--border)", borderRadius: "2px", overflow: "hidden" }}>
                                <div style={{ width: `${progress}%`, height: "100%", background: "var(--accent)", transition: "width 0.3s" }} />
                            </div>
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
                                <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
                                <line x1="7" y1="2" x2="7" y2="22" />
                                <line x1="17" y1="2" x2="17" y2="22" />
                                <line x1="2" y1="12" x2="22" y2="12" />
                                <line x1="2" y1="7" x2="7" y2="7" />
                                <line x1="2" y1="17" x2="7" y2="17" />
                                <line x1="17" y1="17" x2="22" y2="17" />
                                <line x1="17" y1="7" x2="22" y2="7" />
                            </svg>
                            <p style={{ color: "var(--foreground-muted)", margin: 0, fontWeight: 500 }}>
                                Clic para subir video
                            </p>
                            <p style={{
                                color: "var(--foreground-muted)",
                                fontSize: "0.75rem",
                                marginTop: "0.25rem"
                            }}>
                                MP4, WEBM, MOV (max. 500MB)
                            </p>
                        </>
                    )}
                </div>
            )}

            <input
                ref={inputRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
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
