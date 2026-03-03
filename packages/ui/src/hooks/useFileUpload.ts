"use client";

import { useState, useCallback } from "react";
import imageCompression from "browser-image-compression";

interface UploadOptions {
    endpoint: string;
    maxSizeMB?: number;
    maxWidthOrHeight?: number;
    token?: string;
    tenantId?: string;
    folder?: string;
}

export function useFileUpload() {
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const uploadFile = useCallback(
        async (file: File, options: UploadOptions): Promise<string | null> => {
            setIsUploading(true);
            setProgress(0);
            setError(null);

            try {
                let fileToUpload = file;

                // Image optimization logic
                if (file.type.startsWith("image/")) {
                    const compressionOptions = {
                        maxSizeMB: options.maxSizeMB || 2,
                        maxWidthOrHeight: options.maxWidthOrHeight || 1920,
                        useWebWorker: true,
                        initialQuality: 0.85,
                    };

                    try {
                        fileToUpload = await imageCompression(file, compressionOptions);
                        // Re-assign name after compression as some browsers drop it
                        fileToUpload = new File([fileToUpload], file.name, {
                            type: fileToUpload.type,
                        });
                    } catch (compressionError) {
                        console.error("Error compressing image:", compressionError);
                        // Optionally, we could fallback to the original file, but we'll try uploading anyway
                    }
                }

                // Upload to backend using XMLHttpRequest for upload progress
                return await new Promise<string>((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    const targetUrl = new URL(options.endpoint);

                    if (options.folder) {
                        targetUrl.searchParams.set("folder", options.folder);
                    }

                    xhr.open("POST", targetUrl.toString());

                    if (options.token) {
                        xhr.setRequestHeader("Authorization", `Bearer ${options.token}`);
                    }
                    if (options.tenantId) {
                        xhr.setRequestHeader("x-tenant-id", options.tenantId);
                    }

                    xhr.upload.onprogress = (event) => {
                        if (event.lengthComputable) {
                            const percentComplete = Math.round((event.loaded / event.total) * 100);
                            setProgress(percentComplete);
                        }
                    };

                    xhr.onload = () => {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            try {
                                const response = JSON.parse(xhr.responseText);
                                // Asume { url: string, key: string } returned by NestJS
                                resolve(response.url);
                            } catch (e) {
                                reject(new Error("Error parsing server response"));
                            }
                        } else {
                            try {
                                const errorResp = JSON.parse(xhr.responseText);
                                reject(new Error(errorResp.message || "Upload failed"));
                            } catch (e) {
                                reject(new Error(`Upload failed with status: ${xhr.status}`));
                            }
                        }
                    };

                    xhr.onerror = () => {
                        reject(new Error("Network error during file upload"));
                    };

                    const formData = new FormData();
                    formData.append("file", fileToUpload);

                    xhr.send(formData);
                });
            } catch (err: any) {
                setError(err.message || "An unexpected error occurred");
                return null;
            } finally {
                setIsUploading(false);
                // We do not reset progress immediately so the user sees 100% for a moment
                setTimeout(() => setProgress(0), 1000);
            }
        },
        []
    );

    return { uploadFile, isUploading, progress, error };
}
