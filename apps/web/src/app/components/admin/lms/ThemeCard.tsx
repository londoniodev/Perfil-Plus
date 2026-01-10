"use client";

import React from 'react';
import Link from 'next/link';
import styles from '@/app/(dashboard)/admin/cursos/lms.module.css';

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
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                        </svg>
                        {theme._count?.courses || 0} cursos
                    </span>
                    <span className={styles.themeMetaItem}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="4" y1="9" x2="20" y2="9" />
                            <line x1="4" y1="15" x2="20" y2="15" />
                            <line x1="10" y1="3" x2="8" y2="21" />
                            <line x1="16" y1="3" x2="14" y2="21" />
                        </svg>
                        #{theme.order}
                    </span>
                    <div className={styles.themeActions}>
                        <Link
                            href={`/admin/cursos/temas/${theme.id}`}
                            className={styles.actionBtn}
                            title="Editar"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                        </Link>
                        <button
                            onClick={handleDelete}
                            className={`${styles.actionBtn} ${styles.danger}`}
                            title="Eliminar"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
