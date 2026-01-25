"use client";

import { useState, useCallback, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { Button } from './button';
import { cn } from '../lib/utils';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure worker to load from CDN to avoid Next.js build issues
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface SecurePdfViewerProps {
    url: string;
    className?: string;
}

export function SecurePdfViewer({ url, className }: SecurePdfViewerProps) {
    const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [pageWidth, setPageWidth] = useState<number>(0);
    const containerRef = useRef<HTMLDivElement>(null);

    // Dynamic resize handler
    const updatePageWidth = useCallback(() => {
        if (containerRef.current) {
            const width = containerRef.current.clientWidth;
            // Subtract padding if needed, or use full width
            setPageWidth(width);
        }
    }, []);

    useEffect(() => {
        updatePageWidth();
        window.addEventListener('resize', updatePageWidth);
        return () => window.removeEventListener('resize', updatePageWidth);
    }, [updatePageWidth]);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
        setIsLoading(false);
        setError(null);
    }

    function onDocumentLoadError(err: Error) {
        setIsLoading(false);
        setError("No se pudo cargar el documento. Es posible que el enlace haya expirado.");
        console.error("PDF Load Error:", err);
    }

    function changePage(offset: number) {
        setPageNumber(prevPageNumber => {
            const newPage = prevPageNumber + offset;
            return Math.max(1, Math.min(newPage, numPages));
        });
    }

    const previousPage = () => changePage(-1);
    const nextPage = () => changePage(1);

    return (
        <div
            className={cn("flex flex-col items-center w-full max-w-4xl mx-auto space-y-4", className)}
            onContextMenu={(e) => e.preventDefault()} // Disable right click
        >
            {/* Controls */}
            <div className="flex items-center justify-between w-full p-2 bg-secondary/50 rounded-lg backdrop-blur-sm sticky top-0 z-10">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={previousPage}
                    disabled={pageNumber <= 1 || isLoading}
                >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Anterior
                </Button>

                <span className="text-sm font-medium">
                    {isLoading ? "Cargando..." : `Página ${pageNumber} de ${numPages}`}
                </span>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={nextPage}
                    disabled={pageNumber >= numPages || isLoading}
                >
                    Siguiente
                    <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
            </div>

            {/* Viewer Container */}
            <div
                ref={containerRef}
                className="relative w-full min-h-[500px] flex justify-center bg-background border rounded-md overflow-hidden select-none"
                style={{ userSelect: 'none', WebkitUserSelect: 'none' }} // Prevent selection CSS
            >
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                )}

                {error ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-destructive p-4 text-center">
                        <AlertCircle className="h-10 w-10 mb-2" />
                        <p>{error}</p>
                    </div>
                ) : (
                    <Document
                        file={url}
                        onLoadSuccess={onDocumentLoadSuccess}
                        onLoadError={onDocumentLoadError}
                        loading={
                            <div className="flex items-center justify-center h-64">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        }
                        className="flex flex-col items-center"
                    >
                        <div className="relative">
                            <Page
                                pageNumber={pageNumber}
                                width={pageWidth > 0 ? pageWidth : undefined}
                                renderTextLayer={false} // Disable text selection/copy
                                renderAnnotationLayer={false} // Disable annotations
                                loading={
                                    <div className="h-[600px] w-full flex items-center justify-center bg-muted/20">
                                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                    </div>
                                }
                            />
                            {/* Security Overlay - Transparent blocking layer */}
                            <div className="absolute inset-0 z-50 bg-transparent" />
                        </div>
                    </Document>
                )}
            </div>
        </div>
    );
}
