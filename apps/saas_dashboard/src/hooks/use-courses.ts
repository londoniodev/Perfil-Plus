"use client";

import { useState, useEffect, useCallback } from "react";
import { Theme } from "@/types/lms";
import { getThemes } from "@/lib/api";

// ============================================================================
// HOOK - Conectado a API real
// ============================================================================

interface UseCoursesResult {
    themes: Theme[];
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

/**
 * Hook para obtener la lista de temas/cursos desde la API.
 */
export function useCourses(): UseCoursesResult {
    const [themes, setThemes] = useState<Theme[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchThemes = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await getThemes();
            setThemes(data);
        } catch (e) {
            setError("Error al cargar los cursos");
            console.error("useCourses error:", e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchThemes();
    }, [fetchThemes]);

    return {
        themes,
        isLoading,
        error,
        refetch: fetchThemes,
    };
}

