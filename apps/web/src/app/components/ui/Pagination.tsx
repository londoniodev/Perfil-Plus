"use client";

import React from "react";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

/**
 * Componente de paginación genérico.
 */
export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    if (totalPages <= 1) return null;

    const canGoPrev = currentPage > 1;
    const canGoNext = currentPage < totalPages;

    return (
        <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "1.5rem" }}>
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={!canGoPrev}
                style={{
                    ...buttonStyle,
                    opacity: canGoPrev ? 1 : 0.5,
                    cursor: canGoPrev ? "pointer" : "not-allowed",
                }}
            >
                Anterior
            </button>
            <span style={{
                padding: "0.5rem 1rem",
                color: "var(--foreground-muted)",
                fontSize: "0.875rem",
                display: "flex",
                alignItems: "center",
            }}>
                Página {currentPage} de {totalPages}
            </span>
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={!canGoNext}
                style={{
                    ...buttonStyle,
                    opacity: canGoNext ? 1 : 0.5,
                    cursor: canGoNext ? "pointer" : "not-allowed",
                }}
            >
                Siguiente
            </button>
        </div>
    );
}

const buttonStyle: React.CSSProperties = {
    padding: "0.5rem 1rem",
    background: "var(--card-bg)",
    border: "1px solid var(--border)",
    borderRadius: "0.375rem",
    color: "var(--foreground)",
    fontSize: "0.875rem",
};
