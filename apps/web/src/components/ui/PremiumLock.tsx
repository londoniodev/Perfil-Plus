"use client";

import Link from "next/link";
import { IconLock } from "@/components/ui/Icons";
import { Button } from "@/components/ui/Button";
import styles from "@/styles/premium.module.css";

interface PremiumLockProps {
    title: string;
    description: string;
    actionHref: string;
    actionText: string;
    icon?: React.ReactNode;
}

export default function PremiumLock({
    title,
    description,
    actionHref,
    actionText,
    icon
}: PremiumLockProps) {
    return (
        <div className={styles.premiumBlock}>
            <div className={styles.premiumIcon}>
                {icon || <IconLock size={48} />}
            </div>
            <h2>{title}</h2>
            <p>{description}</p>
            <Button asChild>
                <Link href={actionHref}>{actionText}</Link>
            </Button>
        </div>
    );
}
