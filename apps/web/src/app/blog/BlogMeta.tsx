"use client";

import { useState } from "react";
import Link from 'next/link';
import { IconChevronDown } from "../components/ui/Icons";
import { Category } from "@/lib/types";
import styles from "@/app/styles/BlogMeta.module.css";

interface BlogMetaProps {
    date: string;
    readingTime?: number;
    category?: Category;
}

export function BlogMeta({ date, readingTime, category }: BlogMetaProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    // Format date: DD/MM/AA
    const formatDate = (dateString: string) => {
        try {
            const d = new Date(dateString);
            const day = d.getDate().toString().padStart(2, '0');
            const month = (d.getMonth() + 1).toString().padStart(2, '0');
            const year = d.getFullYear().toString().slice(-2);
            return `${day}/${month}/${year}`; // DD/MM/AA
        } catch {
            return dateString;
        }
    };

    return (
        <div className={styles.metaContainer}>
            <button
                className={`${styles.toggleBtn} ${isExpanded ? styles.expanded : ''}`}
                onClick={() => setIsExpanded(!isExpanded)}
                aria-label="Ver detalles del artículo"
            >
                <IconChevronDown className={styles.chevron} />
            </button>

            <div className={`${styles.metaContent} ${isExpanded ? styles.show : ''}`}>
                <div className={styles.metaGrid}>
                    {category && (
                        <div className={styles.metaItem}>
                            <span className={styles.label}>Categoría</span>
                            <Link href={`/blog?category=${category.slug}`} className={styles.valueLink}>
                                {category.name}
                            </Link>
                        </div>
                    )}

                    <div className={styles.metaItem}>
                        <span className={styles.label}>Fecha</span>
                        <span className={styles.value}>{formatDate(date)}</span>
                    </div>

                    {readingTime && (
                        <div className={styles.metaItem}>
                            <span className={styles.label}>Tiempo</span>
                            <span className={styles.value}>
                                <span className={styles.icon}>📖</span> {readingTime} mins
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
