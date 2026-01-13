"use client";

import Link from "next/link";
import { IconArrowLeft } from "../components/icons";
import styles from "./BlogBackButton.module.css";

export function BlogBackButton() {
    return (
        <Link href="/blog" className={styles.backButton} aria-label="Volver al blog">
            <IconArrowLeft className={styles.icon} />
        </Link>
    );
}
