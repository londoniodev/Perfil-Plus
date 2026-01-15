"use client";

import styles from "@/styles/admin.module.css";

export interface Tag {
    id: string;
    name: string;
}

interface TagSelectorProps {
    tags: Tag[];
    selectedIds: string[];
    onChange: (ids: string[]) => void;
}

/**
 * Selector de tags con toggle visual tipo "chips".
 */
export default function TagSelector({ tags, selectedIds, onChange }: TagSelectorProps) {
    const toggleTag = (tagId: string) => {
        onChange(
            selectedIds.includes(tagId)
                ? selectedIds.filter((id) => id !== tagId)
                : [...selectedIds, tagId]
        );
    };

    if (tags.length === 0) return null;

    return (
        <div>
            <label className={styles.label}>Tags</label>
            <div className={styles.tagSelector}>
                {tags.map((tag) => {
                    const isSelected = selectedIds.includes(tag.id);
                    return (
                        <button
                            key={tag.id}
                            type="button"
                            onClick={() => toggleTag(tag.id)}
                            className={`${styles.tagChip} ${isSelected ? styles.active : ''}`}
                        >
                            {tag.name}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
