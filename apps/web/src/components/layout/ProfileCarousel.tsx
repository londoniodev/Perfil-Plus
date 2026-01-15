"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "@/styles/sections.module.css";

const images = [
    "/profile_images/mauro_1.png",
    "/profile_images/mauro_2.png",
    "/profile_images/mauro_3.png",
];

export default function ProfileCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length);
        }, 8000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className={styles.profileCarouselContainer}>
            {/* Aura background similar to Hero */}
            <div className={styles.profileAura} />

            {images.map((src, index) => {
                const isActive = index === currentIndex;

                return (
                    <div
                        key={src}
                        className={`${styles.profileImageWrapper} ${isActive ? styles.profileImageWrapperActive : styles.profileImageWrapperInactive}`}
                    >
                        <Image
                            src={src}
                            alt={`Mauro Mera ${index + 1}`}
                            fill
                            className={styles.profileImageImg}
                            sizes="(max-width: 768px) 100vw, 500px"
                            priority={index === 0}
                        />
                    </div>
                );
            })}
        </div>
    );
}
