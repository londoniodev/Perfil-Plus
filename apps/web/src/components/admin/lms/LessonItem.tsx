"use client";

import React from 'react';
import Link from 'next/link';
import { IconEdit, IconTrash } from '@mauromera/ui';
import { Badge } from '@mauromera/ui';
import { Button } from '@mauromera/ui';

interface Lesson {
    id: string;
    title: string;
    slug: string;
    duration: number | null;
    order: number;
    published: boolean;
}

interface LessonItemProps {
    lesson: Lesson;
    courseId: string;
    themeId: string;
    onDelete: (id: string) => void;
}

export default function LessonItem({ lesson, courseId, themeId, onDelete }: LessonItemProps) {
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
                    <Badge variant={lesson.published ? "outline" : "secondary"} className={`font-normal ${lesson.published ? "text-green-600 border-green-200" : "text-gray-500"}`}>
                        {lesson.published ? "Publicado" : "Borrador"}
                    </Badge>
                </div>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                >
                    <Link
                        href={`/admin/cursos/temas/${themeId}/cursos/${courseId}/lecciones/${lesson.id}`}
                        title="Editar"
                    >
                        <IconEdit size={16} />
                    </Link>
                </Button>
                <Button
                    onClick={handleDelete}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    title="Eliminar"
                >
                    <IconTrash size={16} />
                </Button>
            </div>
        </div>
    );
}
