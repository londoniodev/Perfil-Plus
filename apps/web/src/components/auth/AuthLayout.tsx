"use client";

import styles from "@/styles/auth.module.css";
import Image from "next/image";
import { MobileBackButton } from "./MobileBackButton";

interface AuthLayoutProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
    return (
        <div className={styles.desktopSplitLayout}>
            <MobileBackButton />
            {/* Left Side - Image (Hidden on Mobile) */}
            <div className={styles.imageSide}>
                <Image
                    src="/images/hero/mauro_hero.png" // Placeholder, user will change later
                    alt="Mauro Mera"
                    fill
                    style={{ objectFit: 'cover' }}
                    priority
                />
                <div className={styles.imageOverlay}>
                    {/* Optional text or branding overlay */}
                    <div className={styles.quoteBox}>
                        "Transformar el mundo empieza por cuidar el mundo interno."
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className={styles.formSide}>
                <div className={styles.formContainer}>
                    {children}
                </div>
            </div>
        </div>
    );
}
