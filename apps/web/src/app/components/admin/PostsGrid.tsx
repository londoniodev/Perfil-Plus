"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import StatusBadge from "@/app/components/ui/StatusBadge";

// Reusing the Post interface
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

interface PostsGridProps {
    posts: Post[];
    onDelete: (id: string, title: string) => void;
    onTogglePublish: (post: Post) => void;
}

// Icons
const EyeIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const EyeOffIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
);

const EditIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);

const DeleteIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    </svg>
);

export default function PostsGrid({ posts, onDelete, onTogglePublish }: PostsGridProps) {
    const router = useRouter();

    return (
        <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1.5rem",
        }}>
            {posts.map((post) => (
                <div key={post.id} style={{
                    background: "var(--card-bg)",
                    border: "1px solid var(--border)",
                    borderRadius: "1rem",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    transition: "all 0.2s",
                }}>
                    {/* Full Width Image Header */}
                    <div style={{
                        position: "relative",
                        width: "100%",
                        aspectRatio: "16/9",
                        background: "var(--background-secondary)",
                    }}>
                        {post.coverImage ? (
                            <Image
                                src={post.coverImage}
                                alt={post.title}
                                fill
                                style={{ objectFit: "cover" }}
                            />
                        ) : (
                            <div style={{
                                width: "100%",
                                height: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "var(--foreground-muted)",
                            }}>
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                    <circle cx="8.5" cy="8.5" r="1.5" />
                                    <polyline points="21 15 16 10 5 21" />
                                </svg>
                            </div>
                        )}

                        {/* Badges Overlay */}
                        <div style={{
                            position: "absolute",
                            top: "0.75rem",
                            right: "0.75rem",
                            display: "flex",
                            gap: "0.5rem",
                        }}>
                            <StatusBadge
                                label={post.isPremium ? "Premium" : "Gratis"}
                                variant={post.isPremium ? "purple" : "info"}
                            />
                        </div>
                        <div style={{
                            position: "absolute",
                            top: "0.75rem",
                            left: "0.75rem",
                            display: "flex",
                            gap: "0.5rem",
                        }}>
                            <StatusBadge
                                label={post.published ? "Publicado" : "Borrador"}
                                variant={post.published ? "success" : "warning"}
                            />
                        </div>
                    </div>

                    {/* Content */}
                    <div style={{ padding: "1.25rem", flex: 1, display: "flex", flexDirection: "column" }}>
                        <h3 style={{
                            fontSize: "1.1rem",
                            fontWeight: 600,
                            marginBottom: "0.5rem",
                            color: "var(--foreground)",
                            lineHeight: 1.4,
                        }}>
                            {post.title}
                        </h3>

                        <p style={{
                            fontSize: "0.9rem",
                            color: "var(--foreground-muted)",
                            marginBottom: "1rem",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            lineHeight: 1.5,
                            flex: 1,
                        }}>
                            {post.excerpt}
                        </p>

                        {/* Meta */}
                        <div style={{
                            fontSize: "0.8rem",
                            color: "var(--foreground-muted)",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            marginBottom: "1rem",
                            paddingTop: "1rem",
                            borderTop: "1px solid var(--border)",
                        }}>
                            <span>{new Date(post.createdAt).toLocaleDateString("es-CO")}</span>
                            <span>•</span>
                            <span>{post.readingTime ? `${post.readingTime} min` : "Largo"}</span>
                        </div>

                        {/* Actions */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem" }}>
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
                    </div>
                </div>
            ))}
        </div>
    );
}

// Helper Button Component
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
                padding: "0.6rem",
                background: variant === 'danger' ? 'rgba(239, 68, 68, 0.1)' : "transparent",
                border: "1px solid var(--border)",
                borderColor: variant === 'danger' ? 'rgba(239, 68, 68, 0.2)' : "var(--border)",
                borderRadius: "0.5rem",
                cursor: "pointer",
                color: variant === "danger" ? "#ef4444" : "var(--foreground)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = variant === 'danger' ? '#ef4444' : 'var(--accent)';
                if (variant !== 'danger') e.currentTarget.style.color = 'var(--accent)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = variant === 'danger' ? 'rgba(239, 68, 68, 0.2)' : 'var(--border)';
                if (variant !== 'danger') e.currentTarget.style.color = 'var(--foreground)';
            }}
        >
            {children}
        </button>
    );
}
