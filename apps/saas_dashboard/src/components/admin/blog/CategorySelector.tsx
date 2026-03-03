"use client";

import { CategorySelector as SharedCategorySelector } from "@alvarosky/ui";
import { API_BASE, TENANT_ID } from "@/lib/config";
import { Category } from "@/types/blog";

interface CategorySelectorProps {
    categories: Category[];
    selectedId: string;
    onChange: (id: string) => void;
    onCategoryCreated?: (category: Category) => void;
    className?: string;
}

export default function CategorySelector({
    categories,
    selectedId,
    onChange,
    onCategoryCreated,
    className
}: CategorySelectorProps) {
    return (
        <SharedCategorySelector
            categories={categories}
            selectedId={selectedId}
            onChange={onChange}
            onCategoryCreated={onCategoryCreated ? (cat) => {
                // API returns complete category with slug, so cast is safe
                onCategoryCreated(cat as Category);
            } : undefined}
            className={className}
            apiBase={API_BASE}
            tenantId={TENANT_ID}
        />
    );
}
