"use client";

import React from 'react';
import Link from 'next/link';
import { IconEdit, IconTrash, IconBook, IconGrid } from '@mauromera/ui';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@mauromera/ui';
import { Badge } from '@mauromera/ui';
import { Button } from '@mauromera/ui';

interface Theme {
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

interface ThemeCardProps {
    theme: Theme;
    onDelete: (id: string) => void;
}

export default function ThemeCard({ theme, onDelete }: ThemeCardProps) {
    const handleDelete = () => {
        if (confirm(`¿Eliminar el tema "${theme.title}"? Esta acción eliminará también todos los cursos y lecciones asociadas.`)) {
            onDelete(theme.id);
        }
    };

    return (
        <Card className="overflow-hidden hover:border-primary/50 hover:shadow-lg transition-all duration-300">
            <div className="relative h-40 bg-gradient-to-br from-primary/10 to-primary/20 overflow-hidden group">
                {theme.coverImage ? (
                    <img src={theme.coverImage} alt={theme.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">📚</div>
                )}
                <Badge
                    variant={theme.published ? "default" : "secondary"}
                    className={`absolute top-3 right-3 ${theme.published ? "bg-green-500 hover:bg-green-600" : "bg-gray-500 hover:bg-gray-600"}`}
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
                            <IconBook size={14} />
                            {theme._count?.courses || 0} cursos
                        </span>
                        <span className="flex items-center gap-1">
                            <IconGrid size={14} />
                            #{theme.order}
                        </span>
                    </div>
                    <div className="flex gap-1">
                        <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                        >
                            <Link href={`/admin/cursos/temas/${theme.id}`} title="Editar">
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
            </CardContent>
        </Card>
    );
}
