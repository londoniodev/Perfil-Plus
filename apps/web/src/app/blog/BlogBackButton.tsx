"use client";

import Link from "next/link";
import { IconBack as IconArrowLeft } from "../components/ui/Icons";
import styles from "@/app/styles/BlogBackButton.module.css";

export function BlogBackButton() {
    return (
        <Link href="/blog" className={styles.backButton} aria-label="Volver al blog">
            <IconArrowLeft className={styles.icon} />
        </Link>
    );
}
