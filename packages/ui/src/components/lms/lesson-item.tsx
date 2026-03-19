"use client";

import React from 'react';
import { Badge, Button } from "@alvarosky/ui";
import { Pencil, Trash2 } from "lucide-react";

// ============================================
// Types
// ============================================
export interface LmsLesson {
    id: string;
    title: string;
    slug: string;
    duration: number | null;
    order: number;
    published: boolean;
}

export interface LessonItemProps {
    lesson: LmsLesson;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
}

// ============================================
// Component
// ============================================
export function LessonItem({ lesson, onEdit, onDelete }: LessonItemProps) {
    const handleDelete = () => {
        if (confirm(`¿Eliminar la lección "${lesson.title}"?`)) {
            onDelete(lesson.id);
        }
    };

    return (
        <div className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-all duration-200 group">
            <span className="text-muted-foreground text-sm font-medium w-8 text-center bg-muted/30 rounded py-1">
                #{lesson.order}
            </span>
            <div className="flex-1 min-w-0">
                <div className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors truncate">{lesson.title}</div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{lesson.duration ? `${Math.floor(lesson.duration / 60)} min` : "Sin duración"}</span>
                    <span>•</span>
                    <Badge variant={lesson.published ? "outline" : "secondary"} className={`font-normal ${lesson.published ? "text-success border-success/30" : "text-muted-foreground"}`}>
                        {lesson.published ? "Publicado" : "Borrador"}
                    </Badge>
                </div>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                    onClick={() => onEdit(lesson.id)}
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
    );
}
