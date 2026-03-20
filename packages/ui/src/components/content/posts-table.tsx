"use client";

import React from "react";
import { Eye, EyeOff, Edit, Trash } from "lucide-react";
import { Badge } from "../../badge";
import { cn } from "../../lib/utils";

// ============================================
// Types
// ============================================
import { PostGridItem } from "./posts-grid";

export interface PostsTableProps {
    posts: PostGridItem[];
    onDelete: (id: string, title: string) => void;
    onTogglePublish: (post: PostGridItem) => void;
    onEdit: (id: string) => void;
    className?: string;
}

// ============================================
// Component
// ============================================
export function PostsTable({
    posts,
    onDelete,
    onTogglePublish,
    onEdit,
    className
}: PostsTableProps) {
    return (
        <div className={cn("w-full overflow-x-auto rounded-lg border border-border/40 bg-card/60 backdrop-blur-xl shadow-sm transition-all duration-300", className)}>
            <table className="w-full text-sm text-left min-w-[800px]">
                <thead>
                    <tr>
                        <th className="h-10 px-4 font-medium text-muted-foreground bg-muted/50 border-b whitespace-nowrap">Título</th>
                        <th className="h-10 px-4 font-medium text-muted-foreground bg-muted/50 border-b w-[100px] whitespace-nowrap">Estado</th>
                        <th className="h-10 px-4 font-medium text-muted-foreground bg-muted/50 border-b w-[100px] whitespace-nowrap">Tipo</th>
                        <th className="h-10 px-4 font-medium text-muted-foreground bg-muted/50 border-b w-[120px] whitespace-nowrap">Fecha</th>
                        <th className="h-10 px-4 font-medium text-muted-foreground bg-muted/50 border-b w-[150px] whitespace-nowrap">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {posts.map((post) => (
                        <tr key={post.id} className="border-b transition-colors hover:bg-muted/50">
                            {/* Título y slug */}
                            <td className="p-4 align-middle">
                                <div>
                                    <div className="font-medium text-foreground">
                                        {post.title}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        {/* Assuming simple logic for slug since it wasn't in PostGridItem but was used in original Table */}
                                        {/* We might need to add slug to PostGridItem if strictly required, but for now we simplify */}
                                        {post.readingTime && `• ${post.readingTime} min lectura`}
                                    </div>
                                </div>
                            </td>

                            {/* Estado (Publicado/Borrador) */}
                            <td className="p-4 align-middle">
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
                            </td>

                            {/* Tipo (Premium/Gratis) */}
                            <td className="p-4 align-middle">
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
                            </td>

                            {/* Fecha */}
                            <td className="p-4 align-middle text-sm text-muted-foreground">
                                {new Date(post.createdAt).toLocaleDateString("es-CO")}
                            </td>

                            {/* Acciones */}
                            <td className="p-4 align-middle">
                                <div className="flex items-center gap-2">
                                    <ActionButton
                                        onClick={() => onTogglePublish(post)}
                                        title={post.published ? "Despublicar" : "Publicar"}
                                    >
                                        {post.published ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </ActionButton>
                                    <ActionButton
                                        onClick={() => onEdit(post.id)}
                                        title="Editar"
                                    >
                                        <Edit size={16} />
                                    </ActionButton>
                                    <ActionButton
                                        onClick={() => onDelete(post.id, post.title)}
                                        title="Eliminar"
                                        variant="danger"
                                    >
                                        <Trash size={16} />
                                    </ActionButton>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// ============================================
// Helper
// ============================================
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
