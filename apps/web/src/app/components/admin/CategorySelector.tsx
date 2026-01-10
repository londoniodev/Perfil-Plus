"use client";

import { useState } from "react";
import { API_BASE } from "@/lib/config";

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
            <label style={labelStyle}>Categoría</label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
                <select
                    value={selectedId}
                    onChange={(e) => onChange(e.target.value)}
                    style={{ ...inputStyle, flex: 1 }}
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
                    style={{
                        padding: "0.75rem",
                        background: "var(--accent)",
                        color: "white",
                        border: "none",
                        borderRadius: "0.5rem",
                        cursor: isCreating ? "wait" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: isCreating ? 0.7 : 1,
                    }}
                    title="Crear nueva categoría"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.875rem",
    fontWeight: 500,
    color: "var(--foreground)",
    marginBottom: "0.5rem",
};

const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.75rem",
    background: "var(--card-bg)",
    border: "1px solid var(--border)",
    borderRadius: "0.5rem",
    color: "var(--foreground)",
    fontSize: "1rem",
};
