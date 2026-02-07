"use client";

import { BlogEditor as SharedBlogEditor } from "@alvarosky/ui";

interface BlogEditorProps {
    value: string;
    onChange: (html: string) => void;
    placeholder?: string;
}

export default function BlogEditor(props: BlogEditorProps) {
    return <SharedBlogEditor {...props} />;
}
