"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { PostsGrid as SharedPostsGrid, PostGridItem } from "@alvarosky/ui";
import { Post } from "@/types/blog";

interface PostsGridProps {
    posts: Post[];
    onDelete: (id: string, title: string) => void;
    onTogglePublish: (post: Post) => void;
}

export default function PostsGrid({ posts, onDelete, onTogglePublish }: PostsGridProps) {
    const router = useRouter();

    // Map local Post to shared PostGridItem
    const mappedPosts: PostGridItem[] = posts.map(post => ({
        id: post.id,
        title: post.title,
        excerpt: post.excerpt,
        coverImage: post.coverImage,
        published: post.published ?? false,
        isPremium: post.isPremium ?? false, // Handle optional
        readingTime: post.readingTime ?? null,
        createdAt: post.createdAt,
    }));

    return (
        <SharedPostsGrid
            posts={mappedPosts}
            onDelete={onDelete}
            onTogglePublish={(post) => {
                // Find original post to pass back full object if needed, 
                // or just cast since we know it came from here.
                // The shared component passes back a PostGridItem.
                // The parent expects a Post.
                // We find the original post from the props.
                const originalPost = posts.find(p => p.id === post.id);
                if (originalPost) {
                    onTogglePublish(originalPost);
                }
            }}
            onEdit={(id) => router.push(`/admin/blog/editar/${id}`)}
        />
    );
}
