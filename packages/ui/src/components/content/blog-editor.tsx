"use client";

import React, { useRef, useCallback, useEffect } from 'react';
import { useToast } from "../../toast";

interface BlogEditorProps {
    value: string;
    onChange: (html: string) => void;
    placeholder?: string;
}

export function BlogEditor({ value, onChange, placeholder = "Escribe tu contenido aquí..." }: BlogEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const toast = useToast();

    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value) {
            editorRef.current.innerHTML = value;
        }
    }, []);

    const handleInput = useCallback(() => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    }, [onChange]);

    const execCommand = useCallback((command: string, val?: string) => {
        document.execCommand(command, false, val);
        editorRef.current?.focus();
        handleInput();
    }, [handleInput]);

    const insertYouTube = useCallback(() => {
        const url = prompt("URL del video de YouTube:");
        if (!url) return;

        const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
        if (match) {
            const videoId = match[1];
            const iframe = `<div class="youtube-embed" contenteditable="false" style="margin: 1rem 0;"><iframe width="100%" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen style="border-radius: 0.5rem;"></iframe></div><p><br></p>`;
            document.execCommand('insertHTML', false, iframe);
            handleInput();
        } else {
            toast.error("URL de YouTube no válida");
        }
    }, [handleInput, toast]);

    const insertImage = useCallback(() => {
        const url = prompt("URL de la imagen:");
        if (url) {
            const img = `<img src="${url}" alt="Imagen" style="max-width: 100%; height: auto; border-radius: 0.5rem; margin: 1rem 0;" />`;
            document.execCommand('insertHTML', false, img);
            handleInput();
        }
    }, [handleInput]);

    const insertLink = useCallback(() => {
        const url = prompt("URL del enlace:");
        if (url) {
            execCommand('createLink', url);
        }
    }, [execCommand]);

    return (
        <div className="border border-border rounded-lg overflow-hidden max-w-full">
            {/* Toolbar */}
            <div className="flex flex-wrap gap-1 p-2 bg-background border-b border-border">
                <ToolbarButton onClick={() => execCommand('bold')} title="Negrita">
                    <strong>B</strong>
                </ToolbarButton>
                <ToolbarButton onClick={() => execCommand('italic')} title="Cursiva">
                    <em>I</em>
                </ToolbarButton>
                <ToolbarButton onClick={() => execCommand('underline')} title="Subrayado">
                    <u>U</u>
                </ToolbarButton>

                <ToolbarSeparator />

                <ToolbarButton onClick={() => execCommand('formatBlock', 'h2')} title="Título H2">
                    H2
                </ToolbarButton>
                <ToolbarButton onClick={() => execCommand('formatBlock', 'h3')} title="Título H3">
                    H3
                </ToolbarButton>
                <ToolbarButton onClick={() => execCommand('formatBlock', 'p')} title="Párrafo">
                    P
                </ToolbarButton>

                <ToolbarSeparator />

                <ToolbarButton onClick={() => execCommand('insertUnorderedList')} title="Lista">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="8" y1="6" x2="21" y2="6" />
                        <line x1="8" y1="12" x2="21" y2="12" />
                        <line x1="8" y1="18" x2="21" y2="18" />
                        <circle cx="4" cy="6" r="1" fill="currentColor" />
                        <circle cx="4" cy="12" r="1" fill="currentColor" />
                        <circle cx="4" cy="18" r="1" fill="currentColor" />
                    </svg>
                </ToolbarButton>
                <ToolbarButton onClick={() => execCommand('insertOrderedList')} title="Lista numerada">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="10" y1="6" x2="21" y2="6" />
                        <line x1="10" y1="12" x2="21" y2="12" />
                        <line x1="10" y1="18" x2="21" y2="18" />
                        <text x="2" y="8" fontSize="8" fill="currentColor">1</text>
                        <text x="2" y="14" fontSize="8" fill="currentColor">2</text>
                        <text x="2" y="20" fontSize="8" fill="currentColor">3</text>
                    </svg>
                </ToolbarButton>

                <ToolbarSeparator />

                <ToolbarButton onClick={insertLink} title="Insertar enlace">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                    </svg>
                </ToolbarButton>
                <ToolbarButton onClick={insertImage} title="Insertar imagen (URL)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                    </svg>
                </ToolbarButton>
                <ToolbarButton onClick={insertYouTube} title="Insertar video de YouTube">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.33z" />
                        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor" />
                    </svg>
                </ToolbarButton>

                <ToolbarSeparator />

                <ToolbarButton onClick={() => execCommand('justifyLeft')} title="Alinear izquierda">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="17" y1="10" x2="3" y2="10" />
                        <line x1="21" y1="6" x2="3" y2="6" />
                        <line x1="21" y1="14" x2="3" y2="14" />
                        <line x1="17" y1="18" x2="3" y2="18" />
                    </svg>
                </ToolbarButton>
                <ToolbarButton onClick={() => execCommand('justifyCenter')} title="Centrar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="10" x2="6" y2="10" />
                        <line x1="21" y1="6" x2="3" y2="6" />
                        <line x1="21" y1="14" x2="3" y2="14" />
                        <line x1="18" y1="18" x2="6" y2="18" />
                    </svg>
                </ToolbarButton>
            </div>

            {/* Editor */}
            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                data-placeholder={placeholder}
                className="min-h-[400px] p-4 outline-none bg-card text-foreground leading-7 text-base break-all [overflow-wrap:anywhere] whitespace-pre-wrap overflow-x-hidden
                    empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground empty:before:pointer-events-none
                    [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:my-6 [&_h2]:mt-8
                    [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:my-4 [&_h3]:mt-6
                    [&_p]:my-3
                    [&_ul]:my-3 [&_ul]:pl-6
                    [&_ol]:my-3 [&_ol]:pl-6
                    [&_a]:text-primary [&_a]:underline"
            />
        </div>
    );
}

function ToolbarButton({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className="p-2 bg-transparent border border-transparent rounded hover:bg-muted cursor-pointer text-foreground flex items-center justify-center min-w-8 h-8 text-sm font-semibold"
        >
            {children}
        </button>
    );
}

function ToolbarSeparator() {
    return (
        <div className="w-px h-6 bg-border mx-1 self-center" />
    );
}
