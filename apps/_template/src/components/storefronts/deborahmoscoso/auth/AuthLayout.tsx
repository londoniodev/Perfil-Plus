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
            <div className="hidden lg:flex relative bg-black items-end p-12 overflow-hidden">
                <Image
                    src="/external/deborah-auth-bg.jpg"
                    alt="Deborah Moscoso - Soy Deborah Soy Saludable"
                    fill
                    style={{ objectFit: 'cover' }}
                    priority
                    sizes="50vw"
                    className="absolute inset-0 z-0 opacity-70"
                />
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-black via-black/40 to-transparent flex items-end p-12">
                    <div className="text-white text-2xl md:text-3xl font-black font-sans max-w-[90%] leading-none tracking-tighter uppercase italic">
                        "Elegir salud es el mayor acto de <span className="text-fuchsia-500">amor propio</span>."
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex flex-col items-center justify-center p-6 md:p-12 w-full h-full relative z-20">
                <FloatingBackButton className="absolute left-4 top-4 md:left-8 md:top-8" />
                <div className="w-full max-w-[450px] space-y-6">
                    {children}
                </div>
            </div>
        </div>
    );
}

