"use client";

import React, { useState } from "react";
import { useToast } from "../../toast";
import { Button } from "../../button";
import { Plus } from "lucide-react";
import { cn } from "../../lib/utils";

// ============================================
// Types
// ============================================
export interface CategoryItem {
    id: string;
    name: string;
    slug?: string;
    _count?: { posts: number };
}

export interface CategorySelectorProps {
    categories: CategoryItem[];
    selectedId: string;
    onChange: (id: string) => void;
    onCategoryCreated?: (category: CategoryItem) => void;
    className?: string;
    /** API base URL for creating new categories */
    apiBase?: string;
    /** Tenant ID for API headers */
    tenantId?: string;
    /** Endpoint for creating categories (default: /admin/blog/categories) */
    createEndpoint?: string;
    /** Allow creating new categories */
    allowCreate?: boolean;
    /** Label for empty option */
    emptyLabel?: string;
}

// ============================================
// Component
// ============================================
export function CategorySelector({
    categories,
    selectedId,
    onChange,
    onCategoryCreated,
    className,
    apiBase,
    tenantId,
    createEndpoint = "/admin/blog/categories",
    allowCreate = true,
    emptyLabel = "Sin categoría"
}: CategorySelectorProps) {
    const [isCreating, setIsCreating] = useState(false);
    const toast = useToast();

    const canCreate = allowCreate && apiBase && tenantId;

    const handleCreateCategory = async () => {
        if (!apiBase || !tenantId) return;

        const name = prompt("Nombre de la nueva categoría:");
        if (!name?.trim()) return;

        setIsCreating(true);
        try {
            const res = await fetch(`${apiBase}${createEndpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "x-tenant-id": tenantId },
                credentials: "include",
                body: JSON.stringify({ name: name.trim() }),
            });

            if (!res.ok) throw new Error("Error al crear categoría");

            const newCat: CategoryItem = await res.json();

            onCategoryCreated?.(newCat);
            onChange(newCat.id);
            toast.success("Categoría creada");
        } catch {
            toast.error("Error al crear categoría");
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className={cn(className)}>
            <div className="flex gap-2">
                <select
                    value={selectedId}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={isCreating}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-primary/10 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <option value="">{emptyLabel}</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                            {cat.name}
                        </option>
                    ))}
                </select>
                {canCreate && (
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleCreateCategory}
                        disabled={isCreating}
                        title="Crear nueva categoría"
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    );
}
