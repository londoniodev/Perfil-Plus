"use client";

import React from 'react';
import Link from 'next/link';
import styles from '@/app/styles/lms.module.css';
import { IconEdit, IconTrash } from '@/app/components/ui/Icons';

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
        <div className={styles.listItem}>
            <span className={styles.itemOrder}>
                #{course.order}
            </span>
            <div className={styles.itemContent}>
                <div className={styles.itemTitle}>{course.title}</div>
                <div className={styles.itemMeta}>
                    {course._count?.lessons || 0} lecciones
                    <span>•</span>
                    <span className={`${styles.itemBadge} ${course.isFree ? styles.free : styles.premium}`}>
                        {course.isFree ? "Gratis" : "Premium"}
                    </span>
                    <span className={`${styles.itemBadge} ${course.published ? styles.published : styles.draft}`}>
                        {course.published ? "Publicado" : "Borrador"}
                    </span>
                </div>
            </div>
            <div className={styles.themeActions}>
                <Link
                    href={`/admin/cursos/temas/${themeId}/cursos/${course.id}`}
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
