"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { PostsTable as SharedPostsTable, PostGridItem } from "@alvarosky/ui";
import { Post } from "@/types/blog";

interface PostsTableProps {
    posts: Post[];
    onDelete: (id: string, title: string) => void;
    onTogglePublish: (post: Post) => void;
}

export default function PostsTable({ posts, onDelete, onTogglePublish }: PostsTableProps) {
    const router = useRouter();

    // Proteger contra posts que no sea un array (API 404)
    const mappedPosts: PostGridItem[] = Array.isArray(posts) ? posts.map(post => ({
        id: post.id,
        title: post.title,
        excerpt: post.excerpt,
        coverImage: post.coverImage || null,
        published: post.published ?? false,
        isPremium: post.isPremium ?? false,
        readingTime: post.readingTime ?? null,
        createdAt: new Date(post.createdAt),
    })) : [];

    return (
        <SharedPostsTable
            posts={mappedPosts}
            onDelete={onDelete}
            onTogglePublish={(post) => {
                const originalPost = posts.find(p => p.id === post.id);
                if (originalPost) {
                    onTogglePublish(originalPost);
                }
            }}
            onEdit={(id) => router.push(`/admin/blog/editar/${id}`)}
        />
    );
}
