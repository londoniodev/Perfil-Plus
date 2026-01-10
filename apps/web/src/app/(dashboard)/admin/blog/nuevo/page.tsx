"use client";

import PostForm from "@/app/components/admin/PostForm";

/**
 * Página para crear un nuevo post del blog.
 * La lógica está centralizada en el componente PostForm.
 */
export default function NewPostPage() {
    return <PostForm mode="create" />;
}
