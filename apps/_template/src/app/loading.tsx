"use client";

import { useTenant } from "./providers";

export default function Loading() {
    const { logoUrl } = useTenant();
    
    return (
        <div
            className="flex h-screen w-full flex-col items-center justify-center gap-6"
            style={{
                background: `radial-gradient(ellipse at center, hsl(var(--primary) / 0.15) 0%, hsl(var(--primary) / 0.05) 50%, #000 100%)`,
            }}
        >
            {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={logoUrl}
                    alt="Cargando"
                    className="w-20 h-20 object-contain rounded-2xl animate-pulse"
                />
            ) : (
                <div
                    className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin"
                />
            )}
            
            <div
                className="w-10 h-1 rounded flex overflow-hidden opacity-80"
                style={{
                    background: `linear-gradient(90deg, transparent, hsl(var(--primary)), transparent)`,
                    animation: "shimmer 1.5s ease-in-out infinite",
                }}
            />

            <style
                dangerouslySetInnerHTML={{
                    __html: `
                        @keyframes shimmer { 0%, 100% { opacity: 0.3; transform: scaleX(0.5); } 50% { opacity: 1; transform: scaleX(1); } }
                    `,
                }}
            />
        </div>
    );
}
