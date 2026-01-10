"use client";

import React from 'react';
import Link from 'next/link';
import styles from '@/app/(dashboard)/admin/cursos/lms.module.css';

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
        <div style={{
            display: "flex",
            alignItems: "center",
            padding: "1rem",
            background: "var(--background)",
            border: "1px solid var(--border)",
            borderRadius: "0.5rem",
            gap: "1rem"
        }}>
            <span style={{ color: "var(--foreground-muted)", fontWeight: 500 }}>
                #{lesson.order}
            </span>
            <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500 }}>{lesson.title}</div>
                <div style={{ fontSize: "0.875rem", color: "var(--foreground-muted)" }}>
                    {lesson.duration ? `${lesson.duration} min` : "Sin duración"} •{" "}
                    <span style={{ color: lesson.published ? "#22c55e" : "#6b7280" }}>
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
    );
}
