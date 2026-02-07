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

    const mappedPosts: PostGridItem[] = posts.map(post => ({
        id: post.id,
        title: post.title,
        excerpt: post.excerpt,
        coverImage: post.coverImage,
        published: post.published ?? false,
        isPremium: post.isPremium ?? false,
        readingTime: post.readingTime ?? null,
        createdAt: post.createdAt,
    }));

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
