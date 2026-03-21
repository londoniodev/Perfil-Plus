"use client";

import React from 'react';
import { Badge, Button } from "@alvarosky/ui";
import { Pencil, Trash2, Eye } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// ============================================
// Types
// ============================================
export interface BlogPostCardData {
    id: string;
    title: string;
    description?: string;
    image?: string;
    published: boolean;
    slug: string;
    publishedAt?: Date | null;
    createdAt: Date;
    author?: {
        name: string;
    } | null;
}

export interface BlogCardProps {
    post: BlogPostCardData;
    onDelete?: (id: string) => void;
    viewUrl?: string; // Optional URL to view the post public page
}

// ============================================
// Component
// ============================================
export function BlogCard({ post, onDelete, viewUrl }: BlogCardProps) {
    const handleDelete = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (onDelete && confirm(`¿Eliminar la publicación "${post.title}"?`)) {
            onDelete(post.id);
        }
    };

    return (
        <div className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition duration-200 group">
            {/* Thumbnail */}
            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border bg-muted">
                {post.image ? (
                    <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                        <span className="text-xs">Sin imagen</span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors truncate">
                    {post.title}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <span>
                        {post.publishedAt
                            ? new Date(post.publishedAt).toLocaleDateString("es-ES")
                            : new Date(post.createdAt).toLocaleDateString("es-ES")}
                    </span>
                    {post.author && (
                        <>
                            <span>•</span>
                            <span>{post.author.name}</span>
                        </>
                    )}
                    <span>•</span>
                    <Badge variant={post.published ? "default" : "secondary"} className={`font-normal ml-1 ${post.published ? "bg-success/10 text-success hover:bg-success/20" : "text-muted-foreground"}`}>
                        {post.published ? "Publicado" : "Borrador"}
                    </Badge>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                {viewUrl && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        asChild
                        title="Ver en sitio"
                    >
                        <Link href={viewUrl} target="_blank">
                            <Eye size={16} />
                        </Link>
                    </Button>
                )}

                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    asChild
                    title="Editar"
                >
                    <Link href={`/blog/publicaciones/editar/${post.id}`}>
                        <Pencil size={16} />
                    </Link>
                </Button>

                {onDelete && (
                    <Button
                        onClick={handleDelete}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        title="Eliminar"
                    >
                        <Trash2 size={16} />
                    </Button>
                )}
            </div>
        </div>
    );
}
