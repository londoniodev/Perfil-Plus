"use client";

import React from "react";
import Image from "next/image";
import { Eye, EyeOff, Edit, Trash } from "lucide-react";
import { Button } from "../../button";
import { Badge } from "../../badge";
import { cn } from "../../lib/utils";

// ============================================
// Types
// ============================================
// We need to define a minimal Post interface here or import it if shared types exist
// For now, we define what we need based on usage
export interface PostGridItem {
    id: string;
    title: string;
    excerpt: string;
    coverImage: string | null;
    published: boolean;
    isPremium: boolean;
    readingTime: number | null;
    createdAt: string | Date;
}

export interface PostsGridProps {
    posts: PostGridItem[];
    onDelete: (id: string, title: string) => void;
    onTogglePublish: (post: PostGridItem) => void;
    onEdit: (id: string) => void;
    className?: string;
}

// ============================================
// Component
// ============================================
export function PostsGrid({
    posts,
    onDelete,
    onTogglePublish,
    onEdit,
    className
}: PostsGridProps) {
    return (
        <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", className)}>
            {posts.map((post) => (
                <div
                    key={post.id}
                    className="group relative flex flex-col bg-card/60 backdrop-blur-xl border border-border/40 rounded-xl shadow-sm overflow-hidden hover:shadow-md hover:border-border/60 hover:-translate-y-1 transition duration-300"
                >
                    {/* Full Width Image Header */}
                    <div className="relative w-full aspect-video overflow-hidden bg-muted">
                        {post.coverImage ? (
                            <Image
                                src={post.coverImage}
                                alt={post.title}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                        ) : (
                            <div className="flex items-center justify-center w-full h-full bg-muted text-4xl text-muted-foreground">
                                📚
                            </div>
                        )}

                        {/* Badges Overlay */}
                        <div className="absolute top-3 right-3 z-10 flex gap-2">
                            <Badge
                                variant={post.isPremium ? "secondary" : "secondary"}
                                className={cn(
                                    post.isPremium
                                        ? "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-200"
                                        : "bg-primary/10 text-primary hover:bg-primary/20 border-primary/20"
                                )}
                            >
                                {post.isPremium ? "Premium" : "Gratis"}
                            </Badge>
                        </div>
                        <div className="absolute top-3 left-3 z-10 flex gap-2">
                            <Badge
                                variant={post.published ? "default" : "outline"}
                                className={cn(
                                    post.published
                                        ? "bg-green-500 hover:bg-green-600"
                                        : "bg-yellow-500/10 text-yellow-600 border-yellow-200 hover:bg-yellow-500/20"
                                )}
                            >
                                {post.published ? "Publicado" : "Borrador"}
                            </Badge>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex flex-col flex-1 p-5">
                        <h3 className="font-semibold text-lg leading-tight mb-2 line-clamp-2">
                            {post.title}
                        </h3>

                        <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">
                            {post.excerpt}
                        </p>

                        {/* Meta */}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-auto pt-4 border-t">
                            <span>{new Date(post.createdAt).toLocaleDateString("es-CO")}</span>
                            <span>•</span>
                            <span>{post.readingTime ? `${post.readingTime} min` : "Largo"}</span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                            <ActionButton
                                onClick={() => onTogglePublish(post)}
                                title={post.published ? "Despublicar" : "Publicar"}
                            >
                                {post.published ? <EyeOff size={18} /> : <Eye size={18} />}
                            </ActionButton>
                            <ActionButton
                                onClick={() => onEdit(post.id)}
                                title="Editar"
                            >
                                <Edit size={18} />
                            </ActionButton>
                            <ActionButton
                                onClick={() => onDelete(post.id, post.title)}
                                title="Eliminar"
                                variant="danger"
                            >
                                <Trash size={18} />
                            </ActionButton>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

// Helper Button Component
interface ActionButtonProps {
    onClick: () => void;
    title: string;
    children: React.ReactNode;
    variant?: "default" | "danger";
}

function ActionButton({ onClick, title, children, variant = "default" }: ActionButtonProps) {
    return (
        <button
            onClick={onClick}
            title={title}
            className={cn(
                "p-2 rounded-md transition-colors",
                variant === 'danger'
                    ? "text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
        >
            {children}
        </button>
    );
}
