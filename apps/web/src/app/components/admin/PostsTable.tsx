"use client";

import React from "react";
import { useRouter } from "next/navigation";
import StatusBadge from "@/app/components/ui/StatusBadge";

// ============================================================================
// TIPOS
// ============================================================================

export interface Post {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    coverImage: string | null;
    isPremium: boolean;
    published: boolean;
    publishedAt: string | null;
    createdAt: string;
    readingTime: number | null;
    categories: { id: string; name: string }[];
    tags: { id: string; name: string }[];
}

interface PostsTableProps {
    posts: Post[];
    onDelete: (id: string, title: string) => void;
    onTogglePublish: (post: Post) => void;
}

// ============================================================================
// ICONOS
// ============================================================================

const EyeIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const EyeOffIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
);

const EditIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);

const DeleteIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    </svg>
);

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function PostsTable({ posts, onDelete, onTogglePublish }: PostsTableProps) {
    const router = useRouter();

    return (
        <div style={{
            background: "var(--card-bg)",
            border: "1px solid var(--border)",
            borderRadius: "1rem",
            overflow: "hidden",
        }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                    <tr style={{ background: "var(--background)" }}>
                        <th style={thStyle}>Título</th>
                        <th style={{ ...thStyle, width: "100px" }}>Estado</th>
                        <th style={{ ...thStyle, width: "100px" }}>Tipo</th>
                        <th style={{ ...thStyle, width: "120px" }}>Fecha</th>
                        <th style={{ ...thStyle, width: "150px" }}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {posts.map((post) => (
                        <tr key={post.id} style={{ borderTop: "1px solid var(--border)" }}>
                            {/* Título y slug */}
                            <td style={tdStyle}>
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
                            <td style={tdStyle}>
                                <StatusBadge
                                    label={post.published ? "Publicado" : "Borrador"}
                                    variant={post.published ? "success" : "warning"}
                                />
                            </td>

                            {/* Tipo (Premium/Gratis) */}
                            <td style={tdStyle}>
                                <StatusBadge
                                    label={post.isPremium ? "Premium" : "Gratis"}
                                    variant={post.isPremium ? "purple" : "info"}
                                />
                            </td>

                            {/* Fecha */}
                            <td style={{ ...tdStyle, fontSize: "0.875rem", color: "var(--foreground-muted)" }}>
                                {new Date(post.createdAt).toLocaleDateString("es-CO")}
                            </td>

                            {/* Acciones */}
                            <td style={tdStyle}>
                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                    <ActionButton
                                        onClick={() => onTogglePublish(post)}
                                        title={post.published ? "Despublicar" : "Publicar"}
                                    >
                                        {post.published ? <EyeOffIcon /> : <EyeIcon />}
                                    </ActionButton>
                                    <ActionButton
                                        onClick={() => router.push(`/admin/blog/editar/${post.id}`)}
                                        title="Editar"
                                    >
                                        <EditIcon />
                                    </ActionButton>
                                    <ActionButton
                                        onClick={() => onDelete(post.id, post.title)}
                                        title="Eliminar"
                                        variant="danger"
                                    >
                                        <DeleteIcon />
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
            style={{
                padding: "0.5rem",
                background: "var(--background)",
                border: "1px solid var(--border)",
                borderRadius: "0.375rem",
                cursor: "pointer",
                color: variant === "danger" ? "#ef4444" : "var(--foreground)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            {children}
        </button>
    );
}

// ============================================================================
// ESTILOS
// ============================================================================

const thStyle: React.CSSProperties = {
    padding: "0.75rem 1rem",
    textAlign: "left",
    fontSize: "0.75rem",
    fontWeight: 600,
    textTransform: "uppercase",
    color: "var(--foreground-muted)",
    letterSpacing: "0.05em",
};

const tdStyle: React.CSSProperties = {
    padding: "1rem",
    verticalAlign: "middle",
};
