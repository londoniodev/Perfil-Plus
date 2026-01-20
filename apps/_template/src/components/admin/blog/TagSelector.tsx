"use client";

import { Badge } from "@alvarosky/ui";
import { cn } from "@/lib/utils";

import { Tag } from "@/types/blog";

interface TagSelectorProps {
    tags: Tag[];
    selectedIds: string[];
    onChange: (ids: string[]) => void;
    className?: string;
}

export default function TagSelector({ tags, selectedIds, onChange, className }: TagSelectorProps) {
    const toggleTag = (tagId: string) => {
        onChange(
            selectedIds.includes(tagId)
                ? selectedIds.filter((id) => id !== tagId)
                : [...selectedIds, tagId]
        );
    };

    if (tags.length === 0) return null;

    return (
        <div className={cn("space-y-2", className)}>
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Tags
            </label>
            <div className="flex flex-wrap gap-2">
                {tags.map((tag) => {
                    const isSelected = selectedIds.includes(tag.id);
                    return (
                        <button
                            key={tag.id}
                            type="button"
                            onClick={() => toggleTag(tag.id)}
                            className={cn(
                                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                                isSelected
                                    ? "border-transparent bg-primary text-primary-foreground hover:bg-primary/80"
                                    : "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80"
                            )}
                        >
                            {tag.name}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

