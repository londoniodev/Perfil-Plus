"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

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
        <div className="relative h-[400px] md:h-[600px] w-full flex items-end justify-center overflow-hidden">
            {/* Aura background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] md:w-[500px] md:h-[500px] bg-primary/30 blur-[100px] animate-aura-pulse rounded-full pointer-events-none" />

            {images.map((src, index) => {
                const isActive = index === currentIndex;

                return (
                    <div
                        key={src}
                        className={cn(
                            "absolute bottom-0 h-full w-full transition-all duration-700",
                            isActive
                                ? "opacity-100 z-10 animate-char-enter"
                                : "opacity-0 z-0 scale-95"
                        )}
                    >
                        <Image
                            src={src}
                            alt={`Mauro Mera ${index + 1}`}
                            fill
                            className="object-contain object-bottom"
                            sizes="(max-width: 768px) 100vw, 500px"
                            priority={index === 0}
                        />
                    </div>
                );
            })}
        </div>
    );
}
