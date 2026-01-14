"use client";

import Link from "next/link";
import styles from "@/app/styles/BlogBreadcrumbs.module.css";

export function BlogBreadcrumbs() {
    return (
        <nav className={styles.breadcrumbs}>
            <Link href="/" className={styles.link}>Inicio</Link>
            <span className={styles.separator}>›</span>
            <Link href="/blog" className={styles.link}>Blog</Link>
            <span className={styles.separator}>›</span>
            <span className={styles.current}>Este artículo</span>
        </nav>
    );
}
