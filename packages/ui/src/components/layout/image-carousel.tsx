"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ImageCarouselProps {
    images: string[];
    interval?: number;
    className?: string; // For the container size
    imageClassName?: string; // For the image styles (e.g. object-contain)
    priority?: boolean;
}

export function ImageCarousel({
    images,
    interval = 8000,
    className,
    imageClassName,
    priority = false,
}: ImageCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (images.length <= 1) return;

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length);
        }, interval);

        return () => clearInterval(timer);
    }, [images.length, interval]);

    if (!images.length) return null;

    return (
        <div className={cn("relative w-full overflow-visible", className)}>
            {images.map((src, index) => {
                const isActive = index === currentIndex;

                return (
                    <div
                        key={src}
                        className={cn(
                            "absolute bottom-0 h-full w-full transition duration-700 ease-out",
                            isActive
                                ? "opacity-100 z-10 scale-100" // Visible and normal scale
                                : "opacity-0 z-0 scale-95"    // Hidden and slightly smaller (for pop-in effect)
                        )}
                    >
                        <Image
                            src={src}
                            alt={`Slide ${index + 1}`}
                            fill
                            className={cn(
                                "object-contain object-bottom drop-shadow-[0_0_30px_rgba(91,141,239,0.5)]",
                                imageClassName
                            )}
                            priority={priority && index === 0}
                            sizes="(max-width: 768px) 100vw, 600px"
                        />
                    </div>
                );
            })}
        </div>
    );
}
