"use client";

import React from 'react';
import Link from 'next/link';
import styles from '@/app/(dashboard)/admin/cursos/lms.module.css';

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
        <div style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            padding: "1rem",
            background: "var(--background)",
            border: "1px solid var(--border)",
            borderRadius: "0.5rem",
        }}>
            <span style={{ color: "var(--foreground-muted)", fontSize: "0.875rem", minWidth: "2rem" }}>
                #{course.order}
            </span>
            <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, color: "var(--foreground)" }}>{course.title}</div>
                <div style={{ fontSize: "0.8125rem", color: "var(--foreground-muted)" }}>
                    {course._count?.lessons || 0} lecciones •{" "}
                    <span style={{ color: course.isFree ? "#22c55e" : "#8b5cf6" }}>
                        {course.isFree ? "Gratis" : "Premium"}
                    </span>
                    {" • "}
                    <span style={{ color: course.published ? "#22c55e" : "#6b7280" }}>
                        {course.published ? "Publicado" : "Borrador"}
                    </span>
                </div>
            </div>
            <Link
                href={`/admin/cursos/temas/${themeId}/cursos/${course.id}`}
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
    );
}
