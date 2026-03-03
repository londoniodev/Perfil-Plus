"use client";

import React, { useState, useEffect } from "react";
import { PlayCircle, VideoIcon } from "lucide-react";

export interface YouTubeEmbedInputProps {
    value?: string;
    onChange?: (url: string) => void;
    placeholder?: string;
    className?: string;
    label?: string;
    error?: string;
}

// Custom Regex extractions to handle youtu.be, youtube.com/watch, youtube.com/embed, etc.
const extractYouTubeId = (url: string): string | null => {
    if (!url) return null;
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
};

export function YouTubeEmbedInput({
    value = "",
    onChange,
    placeholder = "https://www.youtube.com/watch?v=...",
    className = "",
    label = "URL del Video (YouTube)",
    error,
}: YouTubeEmbedInputProps) {
    const [internalValue, setInternalValue] = useState(value);
    const [videoId, setVideoId] = useState<string | null>(null);

    useEffect(() => {
        setInternalValue(value);
        setVideoId(extractYouTubeId(value));
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInternalValue(newValue);
        setVideoId(extractYouTubeId(newValue));

        if (onChange) {
            onChange(newValue);
        }
    };

    return (
        <div className={`space-y-3 ${className}`}>
            {label && (
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {label}
                </label>
            )}

            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <VideoIcon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                </div>
                <input
                    type="url"
                    value={internalValue}
                    onChange={handleChange}
                    placeholder={placeholder}
                    aria-invalid={!!error}
                    aria-describedby={error ? "youtube-input-error" : undefined}
                    className={`flex h-10 w-full rounded-md border ${error ? "border-destructive focus-visible:ring-destructive" : "border-input focus-visible:ring-ring"
                        } bg-background px-3 py-2 pl-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors`}
                />
            </div>

            {error && (
                <p id="youtube-input-error" className="text-[0.8rem] font-medium text-destructive">
                    {error}
                </p>
            )}

            {/* Dynamic Iframe Preview Handler */}
            {videoId ? (
                <div className="relative w-full rounded-lg overflow-hidden border border-border bg-black aspect-video mt-4 animate-in fade-in zoom-in-95">
                    <iframe
                        src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0`}
                        title="Previsualización the YouTube"
                        className="absolute top-0 left-0 w-full h-full rounded-lg"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        loading="lazy"
                    />
                </div>
            ) : internalValue.length > 0 && !videoId ? (
                <div className="flex items-center gap-2 p-3 text-sm text-muted-foreground bg-muted/50 rounded-md mt-4 border border-dashed border-border">
                    <PlayCircle className="h-4 w-4" />
                    <span>La URL proporcionada no parece ser un enlace thel video the YouTube válido.</span>
                </div>
            ) : null}
        </div>
    );
}
