"use client";

import Image from "next/image";

export default function ProfileCarousel() {
    return (
        <div className="relative aspect-[4/5] w-full max-w-md mx-auto group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-purple-500/30 rounded-3xl blur-2xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
            <div className="relative h-full w-full rounded-3xl overflow-hidden border border-white/10 bg-slate-900/40 backdrop-blur-md">
                <Image 
                    src="/images/hero/mauro_hero.png"
                    alt="Mauro Mera"
                    fill
                    className="object-cover object-top hover:scale-105 transition-transform duration-700"
                />
            </div>
        </div>
    );
}
