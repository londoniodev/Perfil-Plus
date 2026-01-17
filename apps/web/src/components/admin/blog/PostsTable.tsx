"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { StatusBadge } from "@mauromera/ui";
import styles from "@/styles/admin.module.css";
import { IconEye, IconEyeOff, IconEdit, IconTrash } from "@mauromera/ui";

// ============================================================================
// TIPOS
// ============================================================================

import { Post } from "@/types/blog";

interface PostsTableProps {
    posts: Post[];
    onDelete: (id: string, title: string) => void;
    onTogglePublish: (post: Post) => void;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function PostsTable({ posts, onDelete, onTogglePublish }: PostsTableProps) {
    const router = useRouter();

    return (
        <div className={styles.tableContainer}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th className={styles.th}>Título</th>
                        <th className={styles.th} style={{ width: "100px" }}>Estado</th>
                        <th className={styles.th} style={{ width: "100px" }}>Tipo</th>
                        <th className={styles.th} style={{ width: "120px" }}>Fecha</th>
                        <th className={styles.th} style={{ width: "150px" }}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {posts.map((post) => (
                        <tr key={post.id} className={styles.tr}>
                            {/* Título y slug */}
                            <td className={styles.td}>
                                <div>
                                    <div style={{ fontWeight: 500, color: "var(--foreground)" }}>
                                        {post.title}
                                    </div>
                                    <div style={{
                                        fontSize: "0.75rem",
                                        color: "var(--foreground-muted)",
                                        marginTop: "0.25rem",
                                    }}>
                                        /{post.slug}
                                        {post.readingTime && ` • ${post.readingTime} min lectura`}
                                    </div>
                                </div>
                            </td>

                            {/* Estado (Publicado/Borrador) */}
                            <td className={styles.td}>
                                <StatusBadge
                                    label={post.published ? "Publicado" : "Borrador"}
                                    variant={post.published ? "success" : "warning"}
                                />
                            </td>

                            {/* Tipo (Premium/Gratis) */}
                            <td className={styles.td}>
                                <StatusBadge
                                    label={post.isPremium ? "Premium" : "Gratis"}
                                    variant={post.isPremium ? "purple" : "info"}
                                />
                            </td>

                            {/* Fecha */}
                            <td className={styles.td} style={{ fontSize: "0.875rem", color: "var(--foreground-muted)" }}>
                                {new Date(post.createdAt).toLocaleDateString("es-CO")}
                            </td>

                            {/* Acciones */}
                            <td className={styles.td}>
                                <div className={styles.actionsColumn}>
                                    <ActionButton
                                        onClick={() => onTogglePublish(post)}
                                        title={post.published ? "Despublicar" : "Publicar"}
                                    >
                                        {post.published ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                                    </ActionButton>
                                    <ActionButton
                                        onClick={() => router.push(`/admin/blog/editar/${post.id}`)}
                                        title="Editar"
                                    >
                                        <IconEdit size={16} />
                                    </ActionButton>
                                    <ActionButton
                                        onClick={() => onDelete(post.id, post.title)}
                                        title="Eliminar"
                                        variant="danger"
                                    >
                                        <IconTrash size={16} />
                                    </ActionButton>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// ============================================================================
// COMPONENTE AUXILIAR
// ============================================================================

interface ActionButtonProps {
    onClick: () => void;
    title: string;
    children: React.ReactNode;
    variant?: "default" | "danger";
}

function ActionButton({ onClick, title, children, variant = "default" }: ActionButtonProps) {
    return (
        <button
            onClick={onClick}
            title={title}
            className={`${styles.actionBtnIcon} ${variant === 'danger' ? styles.danger : ''}`}
        >
            {children}
        </button>
    );
}
