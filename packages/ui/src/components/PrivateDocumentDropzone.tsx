"use client";

import React, { useState, useCallback, useRef } from "react";
import { Lock, File as FileIcon, X, Loader2, LinkIcon, Archive, FileText } from "lucide-react";
import { useFileUpload } from "../hooks/useFileUpload";

export interface PrivateDocumentDropzoneProps {
    endpoint: string;
    token?: string;
    folder?: string;
    maxSizeMB?: number;
    accept?: string;
    value?: string;
    onChange?: (url: string) => void;
    onUploadSuccess?: (url: string) => void;
    onUploadError?: (error: string) => void;
    className?: string;
}

const getFileIcon = (fileName?: string) => {
    if (!fileName) return <FileText className="h-10 w-10 text-primary opacity-80" />;
    if (fileName.endsWith(".zip") || fileName.endsWith(".rar")) {
        return <Archive className="h-10 w-10 text-primary opacity-80" />;
    }
    return <FileText className="h-10 w-10 text-primary opacity-80" />;
};

export function PrivateDocumentDropzone({
    endpoint,
    token,
    folder = "documents",
    maxSizeMB = 100, // By default 100MB for digital products
    accept = ".pdf,.zip,.rar,.epub,.doc,.docx",
    value,
    onChange,
    onUploadSuccess,
    onUploadError,
    className = "",
}: PrivateDocumentDropzoneProps) {
    const [isDragActive, setIsDragActive] = useState(false);
    const [fileData, setFileData] = useState<{ name: string; size: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { uploadFile, isUploading, progress, error } = useFileUpload();

    // Sync external value
    React.useEffect(() => {
        if (value && !fileData) {
            // Extract file name from URL if possible
            const fileName = value.split('/').pop()?.split('?')[0] || "Archivo_Seguro";
            setFileData({ name: fileName, size: "Servidor Remoto" });
        }
    }, [value, fileData]);

    const handleFileChange = useCallback(
        async (file: File) => {
            // Local UI update
            setFileData({
                name: file.name,
                size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
            });

            // Perform upload
            const uploadedUrl = await uploadFile(file, {
                endpoint,
                maxSizeMB,
                token,
                folder,
            });

            if (uploadedUrl) {
                if (onChange) onChange(uploadedUrl);
                if (onUploadSuccess) onUploadSuccess(uploadedUrl);
            } else {
                // Rollback on fail
                if (!value) setFileData(null);
                if (onUploadError && error) onUploadError(error);
            }
        },
        [uploadFile, endpoint, maxSizeMB, token, folder, value, onChange, onUploadSuccess, onUploadError, error]
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
            handleFileChange(droppedFile);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFileChange(e.target.files[0]);
        }
    };

    const clearFile = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isUploading) return;
        setFileData(null);
        if (onChange) onChange("");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className={`relative ${className}`}>
            <div
                className={`relative flex flex-col items-center justify-center w-full min-h-[160px] rounded-lg border-2 border-dashed transition-all duration-200 cursor-pointer overflow-hidden
          ${isDragActive ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"}
          ${fileData && !isUploading ? "border-solid border-primary/30 bg-primary/5" : ""}
          ${isUploading ? "pointer-events-none" : ""}
        `}
                onDragEnter={onDragEnter}
                onDragOver={onDragEnter}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => !isUploading && fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                aria-label="Upload secure file"
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
                    accept={accept}
                    className="hidden"
                    onChange={handleInputChange}
                    aria-hidden="true"
                />

                {/* Uploading Overlay */}
                {isUploading && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm p-4">
                        <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
                        <div className="w-full max-w-[250px]">
                            <div className="flex justify-between text-xs font-semibold mb-2">
                                <span className="text-muted-foreground flex items-center gap-1"><Lock className="w-3 h-3" /> Subida Segura</span>
                                <span className="text-primary">{progress}%</span>
                            </div>
                            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary transition-all duration-300 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* State: Has File (Preview) */}
                {fileData && !isUploading ? (
                    <div className="group relative w-full h-full p-6 flex items-center justify-start gap-4">
                        <div className="flex-shrink-0 p-3 bg-background border rounded-lg shadow-sm">
                            {getFileIcon(fileData.name)}
                        </div>
                        <div className="flex-1 min-w-0 pr-8">
                            <div className="flex items-center gap-2 mb-1">
                                <Lock className="h-3.5 w-3.5 text-green-600" aria-label="Archivo protegido" />
                                <span className="text-xs font-bold uppercase tracking-wider text-green-600">
                                    Protegido
                                </span>
                            </div>
                            <p className="text-sm font-semibold truncate text-foreground" title={fileData.name}>
                                {fileData.name}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {fileData.size}
                            </p>

                            {value && (
                                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground bg-background border px-2 py-1 rounded-md max-w-fit">
                                    <LinkIcon className="h-3 w-3" />
                                    <span className="truncate max-w-[150px]">{value}</span>
                                </div>
                            )}
                        </div>

                        <button
                            type="button"
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-background border hover:bg-destructive hover:text-destructive-foreground hover:border-destructive text-muted-foreground p-2 rounded-full shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            onClick={clearFile}
                            aria-label="Remove secure file"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ) : !fileData && !isUploading ? (
                    /* State: Empty */
                    <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
                        <div className="p-3 bg-muted border border-border/50 rounded-2xl mb-4 relative shadow-sm">
                            <FileIcon className="h-8 w-8 text-muted-foreground/80" />
                            <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-background shadow-sm">
                                <Lock className="h-3 w-3 text-white" />
                            </div>
                        </div>
                        <p className="text-sm font-medium mb-1 text-foreground">
                            Sube tu Archivo Digital
                        </p>
                        <p className="text-xs text-muted-foreground/80">
                            Drag & drop o haz clic para explorar
                        </p>
                        <div className="mt-3 text-[10px] uppercase font-bold tracking-wider text-muted-foreground/60 bg-muted px-2 py-1 rounded-md border">
                            PDF, ZIP, EPUB (Max {maxSizeMB}MB)
                        </div>
                    </div>
                ) : null}
            </div>

            {/* Error Message */}
            {error && !isUploading && (
                <p className="text-sm font-medium text-destructive mt-2 flex items-center gap-1.5" aria-live="polite">
                    <X className="w-4 h-4" /> {error}
                </p>
            )}
        </div>
    );
}
