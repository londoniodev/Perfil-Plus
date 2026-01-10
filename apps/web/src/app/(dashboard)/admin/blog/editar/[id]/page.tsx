"use client";

import { useParams } from "next/navigation";
import PostForm from "@/app/components/admin/PostForm";

/**
 * Página para editar un post existente del blog.
 * La lógica está centralizada en el componente PostForm.
 */
export default function EditPostPage() {
    const params = useParams();
    const postId = params.id as string;

    return <PostForm mode="edit" postId={postId} />;
}
