"use client";

import React, { useRef, useState } from 'react';
import { API_BASE } from "@/lib/config";
import styles from "@/styles/admin.module.css";
import { IconVideo, IconTrash } from "@/components/ui/Icons";
import { useToast } from "@/components/ui/Toast";

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
    const toast = useToast();
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
            toast.error(`Formato podría no ser compatible. Recomendado: MP4, WEBM, MOV`);
        }

        // Validate file size (max 500MB)
        const maxSizeMB = 500;
        if (file.size > maxSizeMB * 1024 * 1024) {
            const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
            toast.error(`El archivo pesa ${fileSizeMB}MB. El tamaño máximo permitido es ${maxSizeMB}MB`);
            return;
        }

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
        <div className={styles.uploaderContainer}>
            <label className={styles.label}>
                {label}
            </label>

            {value ? (
                <div className={styles.previewContainer}>
                    <video
                        src={value}
                        controls
                        className={styles.previewImage}
                        style={{ background: "#000", maxHeight: "400px" }}
                    />
                    <button
                        type="button"
                        onClick={handleRemove}
                        className={styles.removeBtn}
                        title="Eliminar video"
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
                            <div style={{ marginBottom: "0.5rem" }}>Subiendo video... {progress}%</div>
                            <div className={styles.progressBar}>
                                <div className={styles.progressFill} style={{ width: `${progress}%` }} />
                            </div>
                        </div>
                    ) : (
                        <>
                            <IconVideo className={styles.uploadIcon} size={48} strokeWidth={1} />
                            <p className={styles.uploadText}>
                                Clic para subir video
                            </p>
                            <p className={styles.uploadSubtext}>
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


        </div>
    );
}
