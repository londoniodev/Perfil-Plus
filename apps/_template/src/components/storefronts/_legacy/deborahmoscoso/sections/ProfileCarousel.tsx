"use client";

import Image from "next/image";

export default function ProfileCarousel() {
    return (
        <div className="relative aspect-[4/5] w-full max-w-md mx-auto group">
            <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/30 to-violet-500/30 rounded-3xl blur-2xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
            <div className="relative h-full w-full rounded-3xl overflow-hidden border border-white/10 bg-zinc-900/40 backdrop-blur-md">
                <Image 
                    src="/external/deborah-hero-bg.jpg"
                    alt="Deborah Moscoso"
                    fill
                    className="object-cover object-center hover:scale-105 transition-transform duration-700"
                />
            </div>
        </div>
    );
}
