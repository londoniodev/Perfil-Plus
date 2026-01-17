"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { StatusBadge } from "@mauromera/ui";
import styles from "@/styles/admin.module.css";
import { IconEye, IconEyeOff, IconEdit, IconTrash } from "@mauromera/ui";

// Reusing the Post interface
import { Post } from "@/types/blog";

interface PostsGridProps {
    posts: Post[];
    onDelete: (id: string, title: string) => void;
    onTogglePublish: (post: Post) => void;
}

export default function PostsGrid({ posts, onDelete, onTogglePublish }: PostsGridProps) {
    const router = useRouter();

    return (
        <div className={styles.postsGrid}>
            {posts.map((post) => (
                <div key={post.id} className={styles.postCard}>
                    {/* Full Width Image Header */}
                    <div className={styles.postImageWrapper}>
                        {post.coverImage ? (
                            <Image
                                src={post.coverImage}
                                alt={post.title}
                                fill
                                className={styles.postImage}
                            />
                        ) : (
                            <div className={styles.postImagePlaceholder}>
                                📚
                            </div>
                        )}

                        {/* Badges Overlay */}
                        <div className={styles.postBadgesOverlayRight}>
                            <StatusBadge
                                label={post.isPremium ? "Premium" : "Gratis"}
                                variant={post.isPremium ? "purple" : "info"}
                            />
                        </div>
                        <div className={styles.postBadgesOverlayLeft}>
                            <StatusBadge
                                label={post.published ? "Publicado" : "Borrador"}
                                variant={post.published ? "success" : "warning"}
                            />
                        </div>
                    </div>

                    {/* Content */}
                    <div className={styles.postContent}>
                        <h3 className={styles.postTitle}>
                            {post.title}
                        </h3>

                        <p className={styles.postExcerpt}>
                            {post.excerpt}
                        </p>

                        {/* Meta */}
                        <div className={styles.postMeta}>
                            <span>{new Date(post.createdAt).toLocaleDateString("es-CO")}</span>
                            <span>•</span>
                            <span>{post.readingTime ? `${post.readingTime} min` : "Largo"}</span>
                        </div>

                        {/* Actions */}
                        <div className={styles.postActions}>
                            <ActionButton
                                onClick={() => onTogglePublish(post)}
                                title={post.published ? "Despublicar" : "Publicar"}
                            >
                                {post.published ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                            </ActionButton>
                            <ActionButton
                                onClick={() => router.push(`/admin/blog/editar/${post.id}`)}
                                title="Editar"
                            >
                                <IconEdit size={18} />
                            </ActionButton>
                            <ActionButton
                                onClick={() => onDelete(post.id, post.title)}
                                title="Eliminar"
                                variant="danger"
                            >
                                <IconTrash size={18} />
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
            className={`${styles.actionBtnIcon} ${variant === 'danger' ? styles.danger : ''}`}
        >
            {children}
        </button>
    );
}
