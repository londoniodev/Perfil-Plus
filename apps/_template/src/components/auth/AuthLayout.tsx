"use client";

import Image from "next/image";
import { FloatingBackButton } from "./FloatingBackButton";

interface AuthLayoutProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
}

// ── Fallback Neutro Universal ──
// Todos los tenants ven la misma experiencia genérica.
// En el futuro, se puede extender con `brandSettings.authBgImage` y `brandSettings.authQuote`.
const DEFAULT_AUTH_ASSETS = {
    bgImage: "/external/auth-bg.jpg",
    quote: <>"Bienvenido a tu plataforma."</>,
    imageAlt: "Fondo de autenticación"
};

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
    const assets = DEFAULT_AUTH_ASSETS;

    return (
        <div className="grid lg:grid-cols-2 min-h-screen w-full bg-zinc-950 text-zinc-50">
            {/* Left Side - Image (Hidden on Mobile) */}
            <div className="hidden lg:flex relative bg-zinc-900 items-end overflow-hidden">
                <Image
                    src={assets.bgImage}
                    alt={assets.imageAlt}
                    fill
                    style={{ objectFit: 'cover' }}
                    priority
                    sizes="50vw"
                    className="absolute inset-0 z-0"
                />
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-12">
                    <div className="text-white text-2xl md:text-3xl font-light font-sans max-w-[90%] leading-relaxed tracking-wide">
                        {assets.quote}
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex flex-col items-center justify-center p-6 md:p-12 w-full h-full relative z-20 bg-zinc-950/80 backdrop-blur-xl border-l border-white/5 shadow-2xl">
                <FloatingBackButton className="absolute left-4 top-4 md:left-8 md:top-8 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors" />
                <div className="w-full max-w-[450px] space-y-6">
                    {children}
                </div>
            </div>
        </div>
    );
}

