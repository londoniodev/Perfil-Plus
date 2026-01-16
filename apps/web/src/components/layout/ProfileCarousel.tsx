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
        <div className="relative h-[480px] md:h-[720px] w-full flex items-end justify-center overflow-visible">
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
                            className="object-contain object-bottom drop-shadow-[0_0_30px_rgba(91,141,239,0.5)]"
                            sizes="(max-width: 768px) 100vw, 600px"
                            priority={index === 0}
                        />
                    </div>
                );
            })}
        </div>
    );
}
