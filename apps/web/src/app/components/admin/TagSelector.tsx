"use client";

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
            <label style={labelStyle}>Tags</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {tags.map((tag) => {
                    const isSelected = selectedIds.includes(tag.id);
                    return (
                        <button
                            key={tag.id}
                            type="button"
                            onClick={() => toggleTag(tag.id)}
                            style={{
                                padding: "0.375rem 0.75rem",
                                borderRadius: "9999px",
                                border: "1px solid var(--border)",
                                background: isSelected ? "var(--accent)" : "var(--card-bg)",
                                color: isSelected ? "white" : "var(--foreground)",
                                cursor: "pointer",
                                fontSize: "0.875rem",
                                transition: "all 0.15s ease",
                            }}
                        >
                            {tag.name}
                        </button>
                    );
                })}
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
