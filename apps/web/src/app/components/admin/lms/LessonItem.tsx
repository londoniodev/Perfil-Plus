"use client";

import React from 'react';
import Link from 'next/link';
import styles from '@/app/styles/lms.module.css';
import { IconEdit, IconTrash } from '@/app/components/ui/Icons';

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
        <div className={styles.listItem}>
            <span className={styles.itemOrder}>
                #{lesson.order}
            </span>
            <div className={styles.itemContent}>
                <div className={styles.itemTitle}>{lesson.title}</div>
                <div className={styles.itemMeta}>
                    {lesson.duration ? `${lesson.duration} min` : "Sin duración"}
                    <span>•</span>
                    <span className={`${styles.itemBadge} ${lesson.published ? styles.published : styles.draft}`}>
                        {lesson.published ? "Publicado" : "Borrador"}
                    </span>
                </div>
            </div>
            <div className={styles.themeActions}>
                <Link
                    href={`/admin/cursos/temas/${themeId}/cursos/${courseId}/lecciones/${lesson.id}`}
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
    );
}
