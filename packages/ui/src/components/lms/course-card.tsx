"use client";

import React from 'react';
import { Badge, Button } from "@alvarosky/ui";
import { Pencil, Trash2 } from "lucide-react";

// ============================================
// Types
// ============================================
export interface LmsCourse {
    id: string;
    title: string;
    isFree: boolean;
    published: boolean;
    order: number;
    _count?: {
        lessons: number;
    };
}

export interface CourseCardProps {
    course: LmsCourse;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
}

// ============================================
// Component
// ============================================
export function CourseCard({ course, onEdit, onDelete }: CourseCardProps) {
    const handleDelete = () => {
        if (confirm(`¿Eliminar el curso "${course.title}"?`)) {
            onDelete(course.id);
        }
    };

    return (
        <div className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-all duration-200 group">
            <span className="text-muted-foreground text-sm font-medium w-8 text-center bg-muted/30 rounded py-1">
                #{course.order}
            </span>
            <div className="flex-1 min-w-0">
                <div className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">{course.title}</div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{course._count?.lessons || 0} lecciones</span>
                    <span>•</span>
                    <Badge variant={course.isFree ? "secondary" : "default"} className={`font-normal ${course.isFree ? "bg-success/10 text-success hover:bg-success/20" : "bg-primary/10 text-primary hover:bg-primary/20"}`}>
                        {course.isFree ? "Gratis" : "Premium"}
                    </Badge>
                    <Badge variant={course.published ? "outline" : "secondary"} className={`font-normal ${course.published ? "text-success border-success/30" : "text-muted-foreground"}`}>
                        {course.published ? "Publicado" : "Borrador"}
                    </Badge>
                </div>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                    onClick={() => onEdit(course.id)}
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
