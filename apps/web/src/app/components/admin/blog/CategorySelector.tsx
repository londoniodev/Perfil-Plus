"use client";

import { useState } from "react";
import { API_BASE } from "@/lib/config";
import styles from "@/app/styles/admin.module.css";
import { IconPlus } from "@/app/components/ui/Icons";

export interface Category {
    id: string;
    name: string;
    slug: string;
}

interface CategorySelectorProps {
    categories: Category[];
    selectedId: string;
    onChange: (id: string) => void;
    onCategoryCreated?: (category: Category) => void;
}

/**
 * Selector de categorías con opción de crear nuevas.
 */
export default function CategorySelector({
    categories,
    selectedId,
    onChange,
    onCategoryCreated,
}: CategorySelectorProps) {
    const [isCreating, setIsCreating] = useState(false);

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
        } catch {
            alert("Error al crear categoría");
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div>
            <label className={styles.label}>Categoría</label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
                <select
                    value={selectedId}
                    onChange={(e) => onChange(e.target.value)}
                    className={styles.select}
                    style={{ flex: 1 }}
                    disabled={isCreating}
                >
                    <option value="">Sin categoría</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                            {cat.name}
                        </option>
                    ))}
                </select>
                <button
                    type="button"
                    onClick={handleCreateCategory}
                    disabled={isCreating}
                    className={styles.addCategoryBtn}
                    title="Crear nueva categoría"
                >
                    <IconPlus size={20} />
                </button>
            </div>
        </div>
    );
}
