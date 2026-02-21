"use client";

import { useState, useCallback, useEffect } from "react";
import { getCategories, createCategory, updateCategory, deleteCategory } from "@/actions/admin/categories";
import { useToast } from "@alvarosky/ui";

export interface Category {
    id: string;
    name: string;
}

export function useCategories() {
    const toast = useToast();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    const fetchCategories = useCallback(async () => {
        try {
            const data = await getCategories();
            setCategories(data);
        } catch (error) {
            console.error(error);
            toast.error("Error al cargar categorías");
        } finally {
            setInitialLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleCreate = async (name: string, onSuccess?: (category: Category) => void) => {
        if (!name.trim()) return;
        setLoading(true);
        const result = await createCategory(name);
        setLoading(false);

        if (result.success && result.category) {
            setCategories((prev) => [...prev, result.category!].sort((a, b) => a.name.localeCompare(b.name)));
            onSuccess?.(result.category);
            toast.success("Categoría creada");
            return result.category;
        } else {
            toast.error("Error", result.error || "No se pudo crear la categoría");
            return null;
        }
    };

    const handleUpdate = async (id: string, name: string, onSuccess?: () => void) => {
        if (!id || !name.trim()) return;
        setLoading(true);
        const result = await updateCategory(id, name);
        setLoading(false);

        if (result.success) {
            await fetchCategories();
            onSuccess?.();
            toast.success("Categoría actualizada");
            return true;
        } else {
            toast.error("Error", result.error || "No se pudo actualizar");
            return false;
        }
    };

    const handleDelete = async (id: string, onSuccess?: () => void) => {
        if (!confirm("¿Estás seguro de eliminar esta categoría?")) return;
        setLoading(true);
        const result = await deleteCategory(id);
        setLoading(false);

        if (result.success) {
            await fetchCategories();
            onSuccess?.();
            toast.success("Categoría eliminada");
            return true;
        } else {
            toast.error("Error", result.error || "No se pudo eliminar");
            return false;
        }
    };

    return {
        categories,
        loading,
        initialLoading,
        handleCreate,
        handleUpdate,
        handleDelete,
        refresh: fetchCategories
    };
}
