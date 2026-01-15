"use client";

import { useRouter } from "next/navigation";
import { IconBack } from "@/components/ui/Icons";
import styles from "@/styles/dashboard.module.css";

export function MobileBackButton() {
    const router = useRouter();

    return (
        <button
            onClick={() => router.push('/')}
            className={styles.backButton}
            aria-label="Volver al inicio"
        >
            <IconBack />
        </button>
    );
}
