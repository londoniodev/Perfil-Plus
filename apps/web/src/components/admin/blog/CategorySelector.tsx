"use client";

import { useState } from "react";
import { API_BASE } from "@/lib/config";
import { IconPlus } from "@mauromera/ui";
import { useToast } from "@mauromera/ui";
import { Button } from "@mauromera/ui";
import { cn } from "@/lib/utils";

import { Category } from "@/types/blog";

interface CategorySelectorProps {
    categories: Category[];
    selectedId: string;
    onChange: (id: string) => void;
    onCategoryCreated?: (category: Category) => void;
    className?: string; // Add className prop for better composition
}

export default function CategorySelector({
    categories,
    selectedId,
    onChange,
    onCategoryCreated,
    className
}: CategorySelectorProps) {
    const [isCreating, setIsCreating] = useState(false);
    const toast = useToast();

    const handleCreateCategory = async () => {
        const name = prompt("Nombre de la nueva categoría:");
        if (!name?.trim()) return;

        setIsCreating(true);
        try {
            const res = await fetch(`${API_BASE}/admin/blog/categories`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ name: name.trim() }),
            });

            if (!res.ok) throw new Error("Error al crear categoría");

            const newCat: Category = await res.json();

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
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <option value="">Sin categoría</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                            {cat.name}
                        </option>
                    ))}
                </select>
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleCreateCategory}
                    disabled={isCreating}
                    title="Crear nueva categoría"
                >
                    <IconPlus className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
