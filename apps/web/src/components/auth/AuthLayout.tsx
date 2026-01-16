"use client";

import Image from "next/image";
import { FloatingBackButton } from "./FloatingBackButton";

interface AuthLayoutProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
    return (
        <div className="grid lg:grid-cols-2 min-h-screen w-full bg-background">
            {/* Left Side - Image (Hidden on Mobile) */}
            <div className="hidden lg:flex relative bg-muted items-end p-12 overflow-hidden">
                <Image
                    src="/images/hero/mauro_hero.png" // Placeholder, user will change later
                    alt="Mauro Mera"
                    fill
                    style={{ objectFit: 'cover' }}
                    priority
                    className="absolute inset-0 z-0"
                />
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-12">
                    <div className="text-white text-2xl md:text-3xl font-light font-sans max-w-[90%] leading-relaxed tracking-wide">
                        "Transformar el mundo empieza por cuidar el mundo interno."
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex flex-col items-center justify-center p-6 md:p-12 w-full h-full relative z-20">
                <FloatingBackButton />
                <div className="w-full max-w-[450px] space-y-6">
                    {children}
                </div>
            </div>
        </div>
    );
}
