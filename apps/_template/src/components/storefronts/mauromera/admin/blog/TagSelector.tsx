"use client";

import { TagSelector as SharedTagSelector, TagItem } from "@alvarosky/ui";

interface TagSelectorProps {
    tags: TagItem[];
    selectedIds: string[];
    onChange: (ids: string[]) => void;
    className?: string;
}

export default function TagSelector(props: TagSelectorProps) {
    return <SharedTagSelector {...props} />;
}
