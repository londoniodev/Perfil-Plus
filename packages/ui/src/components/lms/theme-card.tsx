"use client";

import React from 'react';
import { Badge, Button, Card, CardContent } from "@alvarosky/ui";
import { Pencil, Trash2, BookOpen, Grid3X3 } from "lucide-react";

// ============================================
// Types
// ============================================
export interface LmsTheme {
    id: string;
    title: string;
    description: string;
    coverImage: string | null;
    published: boolean;
    order: number;
    _count?: {
        courses: number;
    };
}

export interface ThemeCardProps {
    theme: LmsTheme;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
}

// ============================================
// Component
// ============================================
export function ThemeCard({ theme, onEdit, onDelete }: ThemeCardProps) {
    const handleDelete = () => {
        if (confirm(`¿Eliminar el tema "${theme.title}"? Esta acción eliminará también todos los cursos y lecciones asociadas.`)) {
            onDelete(theme.id);
        }
    };

    return (
        <Card className="overflow-hidden hover:border-primary/50 hover:shadow-lg transition duration-300">
            <div className="relative h-40 bg-gradient-to-br from-primary/10 to-primary/20 overflow-hidden group">
                {theme.coverImage ? (
                    <img src={theme.coverImage} alt={theme.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">📚</div>
                )}
                <Badge
                    variant={theme.published ? "default" : "secondary"}
                    className={`absolute top-3 right-3 ${theme.published ? "bg-success hover:bg-success/90 text-success-foreground" : "bg-muted hover:bg-muted/80 text-muted-foreground"}`}
                >
                    {theme.published ? "Publicado" : "Borrador"}
                </Badge>
            </div>
            <CardContent className="p-5">
                <h3 className="text-lg font-semibold mb-2 line-clamp-1">{theme.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10">{theme.description}</p>
                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <BookOpen size={14} />
                            {theme._count?.courses || 0} cursos
                        </span>
                        <span className="flex items-center gap-1">
                            <Grid3X3 size={14} />
                            #{theme.order}
                        </span>
                    </div>
                    <div className="flex gap-1">
                        <Button
                            onClick={() => onEdit(theme.id)}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            title="Editar"
                        >
                            <Pencil size={16} />
                        </Button>
                        <Button
                            onClick={handleDelete}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            title="Eliminar"
                        >
                            <Trash2 size={16} />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
