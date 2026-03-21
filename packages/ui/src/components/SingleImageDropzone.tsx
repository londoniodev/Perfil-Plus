"use client";

import React, { useState, useCallback, useRef } from "react";
import { UploadCloud, X, ImageIcon, Loader2 } from "lucide-react";
import { useFileUpload } from "../hooks/useFileUpload";

export interface SingleImageDropzoneProps {
    endpoint: string;
    token?: string;
    tenantId?: string;
    folder?: string;
    maxSizeMB?: number;
    value?: string;
    onChange?: (url: string) => void;
    onUploadSuccess?: (url: string) => void;
    onUploadError?: (error: string) => void;
    className?: string;
}

export function SingleImageDropzone({
    endpoint,
    token,
    tenantId,
    folder = "images",
    maxSizeMB = 2,
    value,
    onChange,
    onUploadSuccess,
    onUploadError,
    className = "",
}: SingleImageDropzoneProps) {
    const [isDragActive, setIsDragActive] = useState(false);
    const [preview, setPreview] = useState<string | null>(value || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { uploadFile, isUploading, progress, error } = useFileUpload();

    // Sync external value
    React.useEffect(() => {
        if (value !== undefined) {
            setPreview(value);
        }
    }, [value]);

    const handleFileChange = useCallback(
        async (file: File) => {
            // Local UI preview
            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);

            // Perform upload
            const uploadedUrl = await uploadFile(file, {
                endpoint,
                maxSizeMB,
                token,
                tenantId,
                folder,
            });

            if (uploadedUrl) {
                if (onChange) onChange(uploadedUrl);
                if (onUploadSuccess) onUploadSuccess(uploadedUrl);
            } else {
                // Rollback on fail
                setPreview(value || null);
                if (onUploadError && error) onUploadError(error);
            }
        },
        [uploadFile, endpoint, maxSizeMB, token, tenantId, folder, value, onChange, onUploadSuccess, onUploadError, error]
    );

    const onDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(true);
    };

    const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
    };

    const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);

        if (isUploading) return;

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.type.startsWith("image/")) {
                handleFileChange(droppedFile);
            }
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFileChange(e.target.files[0]);
        }
    };

    const clearImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isUploading) return;
        setPreview(null);
        if (onChange) onChange("");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className={`relative ${className}`}>
            <div
                className={`relative flex flex-col items-center justify-center w-full min-h-[200px] rounded-lg border-2 border-dashed transition duration-200 overflow-hidden cursor-pointer
          ${isDragActive ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"}
          ${preview && !isUploading ? "border-solid border-border/50" : ""}
          ${isUploading ? "pointer-events-none" : ""}
        `}
                onDragEnter={onDragEnter}
                onDragOver={onDragEnter}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => !isUploading && fileInputRef.current?.click()}
                // Accessibility
                role="button"
                tabIndex={0}
                aria-label="Upload an image"
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        !isUploading && fileInputRef.current?.click();
                    }
                }}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleInputChange}
                    aria-hidden="true"
                />

                {/* Uploading Overlay */}
                {isUploading && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
                        <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
                        <div className="w-3/4 max-w-[200px]">
                            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary transition duration-300 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <p className="text-center text-sm font-medium mt-2 text-foreground">
                                {progress}%
                            </p>
                        </div>
                    </div>
                )}

                {/* Preview State */}
                {preview && !isUploading ? (
                    <div className="group relative w-full h-full min-h-[200px] flex items-center justify-center bg-muted/20">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={preview}
                            alt="Uploaded preview"
                            className="max-w-full max-h-[300px] object-contain rounded-md"
                        />
                        {/* Hover overlay for delete */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                                type="button"
                                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground p-2 rounded-full shadow-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                onClick={clearImage}
                                aria-label="Remove image"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                ) : !preview && !isUploading ? (
                    /* Empty State */
                    <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
                        <div className="p-4 bg-muted rounded-full mb-4">
                            <UploadCloud className="h-8 w-8 text-muted-foreground/80" />
                        </div>
                        <p className="text-sm font-medium mb-1">
                            Haz clic o arrastra una imagen aquí
                        </p>
                        <p className="text-xs text-muted-foreground/70">
                            JPG, PNG, WEBP (Max {maxSizeMB}MB)
                        </p>
                    </div>
                ) : null}
            </div>

            {/* Error Message */}
            {error && !isUploading && (
                <p className="text-sm font-medium text-destructive mt-2" aria-live="polite">
                    {error}
                </p>
            )}
        </div>
    );
}
