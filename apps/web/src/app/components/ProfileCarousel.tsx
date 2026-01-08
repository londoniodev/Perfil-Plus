"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

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
        <div className="profile-carousel-container">
            {/* Aura background similar to Hero */}
            <div className="profile-aura" />

            {images.map((src, index) => {
                const isActive = index === currentIndex;
                // Determine if this image is the "next" one in the cycle, or if it's inactive
                // We only really need to animate the active one entering. The previous one can just fade out or stay behind.

                return (
                    <div
                        key={src}
                        className={`profile-image-wrapper ${isActive ? "active" : "inactive"}`}
                    >
                        <Image
                            src={src}
                            alt={`Mauro Mera ${index + 1}`}
                            fill
                            className="profile-image-img"
                            sizes="(max-width: 768px) 100vw, 500px"
                            priority={index === 0} // Priority for the first image
                        />
                    </div>
                );
            })}
        </div>
    );
}
