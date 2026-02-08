"use client";

import PostForm from "@/components/admin/blog/PostForm";

/**
 * Página para crear un nuevo post del blog.
 * La lógica está centralizada en el componente PostForm.
 */
export default function NewPostPage() {
    return <PostForm mode="create" />;
}

