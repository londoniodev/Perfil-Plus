"use client";

import { useState, useEffect } from "react";
import { Theme } from "@/types/lms";
import { getThemes } from "@/lib/api";

// ============================================================================
// MOCK DATA - Para desarrollo y testing
// ============================================================================
const MOCK_THEMES: Theme[] = [
    {
        id: "mock-1",
        title: "Liderazgo Transformacional",
        slug: "liderazgo-transformacional",
        description: "Desarrolla habilidades de liderazgo que inspiren y transformen equipos.",
        coverImage: null,
        order: 1,
        published: true,
        _count: { courses: 5 },
    },
    {
        id: "mock-2",
        title: "Psicología Organizacional",
        slug: "psicologia-organizacional",
        description: "Comprende la dinámica humana en las organizaciones modernas.",
        coverImage: null,
        order: 2,
        published: true,
        _count: { courses: 3 },
    },
    {
        id: "mock-3",
        title: "Desarrollo Personal",
        slug: "desarrollo-personal",
        description: "Herramientas para el crecimiento personal y profesional.",
        coverImage: null,
        order: 3,
        published: true,
        _count: { courses: 4 },
    },
];

// ============================================================================
// HOOK
// ============================================================================

interface UseCoursesOptions {
    useMockData?: boolean;
}

interface UseCoursesResult {
    themes: Theme[];
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

/**
 * Hook para obtener la lista de temas/cursos.
 * Soporta modo mock para desarrollo y testing.
 */
export function useCourses(options: UseCoursesOptions = {}): UseCoursesResult {
    const { useMockData = false } = options;

    const [themes, setThemes] = useState<Theme[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchThemes = async () => {
        if (useMockData) {
            // Simular delay de red
            await new Promise(resolve => setTimeout(resolve, 500));
            setThemes(MOCK_THEMES);
            setIsLoading(false);
            return;
        }

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
    };

    useEffect(() => {
        fetchThemes();
    }, [useMockData]);

    return {
        themes,
        isLoading,
        error,
        refetch: fetchThemes,
    };
}
