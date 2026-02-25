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
        <div className="grid lg:grid-cols-2 min-h-screen w-full bg-slate-50 text-slate-900">
            {/* Left Side - Image (Hidden on Mobile) */}
            <div className="hidden lg:flex relative bg-slate-200 items-end p-12 overflow-hidden">
                <Image
                    src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&q=80"
                    alt="Plato gourmet saludable"
                    fill
                    style={{ objectFit: 'cover' }}
                    priority
                    sizes="50vw"
                    className="absolute inset-0 z-0"
                />
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-12">
                    <div className="text-white text-2xl md:text-3xl font-light font-sans max-w-[90%] leading-relaxed tracking-wide">
                        "La buena comida es el fundamento de la felicidad."
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex flex-col items-center justify-center p-6 md:p-12 w-full h-full relative z-20 bg-white shadow-xl shadow-slate-200/50">
                <FloatingBackButton className="absolute left-4 top-4 md:left-8 md:top-8 text-slate-900 hover:bg-slate-100" />
                <div className="w-full max-w-[450px] space-y-6">
                    {children}
                </div>
            </div>
        </div>
    );
}

