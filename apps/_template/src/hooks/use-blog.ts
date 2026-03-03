"use client";

import { useState, useEffect, useCallback } from "react";
import { Post, Category } from "@/types/blog";
import { getPosts, getCategories } from "@/lib/api";
import { useTenant } from "@/app/providers";

// ============================================================================
// HOOK - Conectado a API real
// ============================================================================

interface UseBlogOptions {
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
 * Hook para obtener posts del blog con categorías desde la API.
 * Soporta paginación y filtro por categoría.
 */
export function useBlog(options: UseBlogOptions = {}): UseBlogResult {
    const { tenantId } = useTenant();
    const { page = 1, limit = 9, category } = options;

    const [posts, setPosts] = useState<Post[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBlogData = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const [postsData, categoriesData] = await Promise.all([
                getPosts(tenantId, page, limit, category),
                getCategories(tenantId),
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
    }, [page, limit, category]);

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

