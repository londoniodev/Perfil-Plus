"use client";

import { useState, useEffect, useCallback } from "react";
import { Post, Category } from "@/types/blog";
import { getPosts, getCategories } from "@/lib/api";

// ============================================================================
// MOCK DATA - Para desarrollo y testing
// ============================================================================
const MOCK_POSTS: Post[] = [
    {
        id: "mock-1",
        title: "El Arte del Liderazgo Auténtico",
        slug: "arte-liderazgo-autentico",
        excerpt: "Descubre cómo desarrollar un estilo de liderazgo genuino que conecte con las personas.",
        content: "<p>Contenido del artículo...</p>",
        coverImage: null,
        isPremium: false,
        published: true,
        authorName: "Mauro Mera",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        categories: [{ id: "cat-1", name: "Liderazgo", slug: "liderazgo" }],
        tags: [],
    },
    {
        id: "mock-2",
        title: "Psicología del Cambio Organizacional",
        slug: "psicologia-cambio-organizacional",
        excerpt: "Las claves psicológicas para gestionar transiciones en las organizaciones.",
        content: "<p>Contenido del artículo...</p>",
        coverImage: null,
        isPremium: true,
        published: true,
        authorName: "Mauro Mera",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        categories: [{ id: "cat-2", name: "Psicología", slug: "psicologia" }],
        tags: [],
    },
    {
        id: "mock-3",
        title: "Mindfulness en el Trabajo",
        slug: "mindfulness-trabajo",
        excerpt: "Técnicas de atención plena para mejorar tu productividad y bienestar laboral.",
        content: "<p>Contenido del artículo...</p>",
        coverImage: null,
        isPremium: false,
        published: true,
        authorName: "Mauro Mera",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        categories: [{ id: "cat-3", name: "Desarrollo Personal", slug: "desarrollo-personal" }],
        tags: [],
    },
];

const MOCK_CATEGORIES: Category[] = [
    { id: "cat-1", name: "Liderazgo", slug: "liderazgo" },
    { id: "cat-2", name: "Psicología", slug: "psicologia" },
    { id: "cat-3", name: "Desarrollo Personal", slug: "desarrollo-personal" },
];

// ============================================================================
// HOOK
// ============================================================================

interface UseBlogOptions {
    useMockData?: boolean;
    page?: number;
    limit?: number;
    category?: string;
}

interface UseBlogResult {
    posts: Post[];
    categories: Category[];
    totalPages: number;
    currentPage: number;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

/**
 * Hook para obtener posts del blog con categorías.
 * Soporta paginación, filtro por categoría y modo mock.
 */
export function useBlog(options: UseBlogOptions = {}): UseBlogResult {
    const { useMockData = false, page = 1, limit = 9, category } = options;

    const [posts, setPosts] = useState<Post[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBlogData = useCallback(async () => {
        if (useMockData) {
            await new Promise(resolve => setTimeout(resolve, 500));

            let filteredPosts = MOCK_POSTS;
            if (category) {
                filteredPosts = MOCK_POSTS.filter(p =>
                    p.categories.some(c => c.slug === category)
                );
            }

            setPosts(filteredPosts);
            setCategories(MOCK_CATEGORIES);
            setTotalPages(1);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            const [postsData, categoriesData] = await Promise.all([
                getPosts(page, limit, category),
                getCategories(),
            ]);

            setPosts(postsData.data);
            setTotalPages(postsData.meta.totalPages);
            setCategories(categoriesData);
        } catch (e) {
            setError("Error al cargar los artículos");
            console.error("useBlog error:", e);
        } finally {
            setIsLoading(false);
        }
    }, [useMockData, page, limit, category]);

    useEffect(() => {
        fetchBlogData();
    }, [fetchBlogData]);

    return {
        posts,
        categories,
        totalPages,
        currentPage: page,
        isLoading,
        error,
        refetch: fetchBlogData,
    };
}
