"use client";

import React from 'react';
import Link from 'next/link';
import { IconEdit, IconTrash } from '@/components/ui/Icons';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface Course {
    id: string;
    title: string;
    description: string;
    published: boolean;
    isFree: boolean;
    order: number;
    _count?: {
        lessons: number;
    };
}

interface CourseCardProps {
    course: Course;
    themeId: string;
    onDelete: (id: string) => void;
}

export default function CourseCard({ course, themeId, onDelete }: CourseCardProps) {
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
                    <Badge variant={course.isFree ? "secondary" : "default"} className={`font-normal ${course.isFree ? "bg-green-500/10 text-green-600 hover:bg-green-500/20" : "bg-purple-500/10 text-purple-600 hover:bg-purple-500/20"}`}>
                        {course.isFree ? "Gratis" : "Premium"}
                    </Badge>
                    <Badge variant={course.published ? "outline" : "secondary"} className={`font-normal ${course.published ? "text-green-600 border-green-200" : "text-gray-500"}`}>
                        {course.published ? "Publicado" : "Borrador"}
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
                        href={`/admin/cursos/temas/${themeId}/cursos/${course.id}`}
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
