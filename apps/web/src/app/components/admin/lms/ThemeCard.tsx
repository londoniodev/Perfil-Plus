"use client";

import React from 'react';
import Link from 'next/link';
import styles from '@/app/styles/lms.module.css';
import { IconEdit, IconTrash, IconBook, IconGrid } from '@/app/components/ui/Icons';

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
        <div className={styles.themeCard}>
            <div className={styles.themeImage}>
                {theme.coverImage ? (
                    <img src={theme.coverImage} alt={theme.title} />
                ) : (
                    <div className={styles.themeImagePlaceholder}>📚</div>
                )}
                <span className={`${styles.themeBadge} ${theme.published ? styles.published : styles.draft}`}>
                    {theme.published ? "Publicado" : "Borrador"}
                </span>
            </div>
            <div className={styles.themeContent}>
                <h3 className={styles.themeTitle}>{theme.title}</h3>
                <p className={styles.themeDescription}>{theme.description}</p>
                <div className={styles.themeMeta}>
                    <span className={styles.themeMetaItem}>
                        <IconBook size={16} style={{ marginRight: '0.25rem' }} />
                        {theme._count?.courses || 0} cursos
                    </span>
                    <span className={styles.themeMetaItem}>
                        <IconGrid size={16} style={{ marginRight: '0.25rem' }} />
                        #{theme.order}
                    </span>
                    <div className={styles.themeActions}>
                        <Link
                            href={`/admin/cursos/temas/${theme.id}`}
                            className={styles.actionBtn}
                            title="Editar"
                        >
                            <IconEdit size={16} />
                        </Link>
                        <button
                            onClick={handleDelete}
                            className={`${styles.actionBtn} ${styles.danger}`}
                            title="Eliminar"
                        >
                            <IconTrash size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
