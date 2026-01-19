"use client";

import * as React from "react";
import { Button } from "./button";

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
        <div className="pagination">
            <Button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={!canGoPrev}
                variant="pagination"
            >
                Anterior
            </Button>
            <span className="pagination-info">
                Página {currentPage} de {totalPages}
            </span>
            <Button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={!canGoNext}
                variant="pagination"
            >
                Siguiente
            </Button>
        </div>
    );
}

export { Pagination };


