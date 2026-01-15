"use client";

import { useMemo } from "react";

interface CaseVisualProps {
    category: string;
    color: string;
    id: number;
}

export function CaseVisual({ category, color, id }: CaseVisualProps) {
    const visualConfig = useMemo(() => {
        const seed = id * 137;
        const getType = () => {
            if (category === "Empresas") return "structural";
            if (category === "Explora") return "flow";
            if (category === "Liderazgo") return "connections";
            return "organic";
        };

        return {
            type: getType(),
            rotation: (seed % 360),
            scale: 0.8 + (seed % 40) / 100,
            shapes: [1, 2, 3].map(i => ({
                offset: (seed * i) % 100,
                size: 50 + ((seed * i) % 150),
                delay: i * 2,
            }))
        };
    }, [category, id]);

    return (
        <div
            className="relative aspect-square rounded-2xl overflow-hidden"
            style={{
                background: `linear-gradient(135deg, ${color}10 0%, rgba(0,0,0,0) 100%)`,
                border: `1px solid ${color}20`,
            }}
        >
            {/* Background noise texture effect */}
            <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml,...')] pointer-events-none" />

            {/* Abstract Shapes based on type */}

            {visualConfig.type === "structural" && (
                <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ transform: `rotate(${visualConfig.rotation}deg)` }}
                >
                    <div
                        className="absolute w-32 h-32 rounded-lg"
                        style={{ border: `2px solid ${color}` }}
                    />
                    <div
                        className="absolute w-20 h-20 rounded-md translate-x-8 translate-y-8"
                        style={{ background: color }}
                    />
                    <div
                        className="absolute w-24 h-24 rounded-lg -translate-x-4 -translate-y-4"
                        style={{ border: `1px dashed ${color}` }}
                    />
                </div>
            )}

            {visualConfig.type === "flow" && (
                <div className="absolute inset-0 flex items-center justify-center">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="absolute rounded-full"
                            style={{
                                width: `${200 + i * 80}px`,
                                height: `${200 + i * 80}px`,
                                border: `1px solid ${color}`,
                                opacity: 0.4 - (i * 0.1),
                                transform: `scale(${visualConfig.scale})`
                            }}
                        />
                    ))}
                    <div
                        className="absolute w-24 h-24 rounded-full"
                        style={{
                            background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
                        }}
                    />
                </div>
            )}

            {visualConfig.type === "connections" && (
                <div className="absolute inset-0">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="absolute w-3 h-3 rounded-full"
                            style={{
                                top: `${20 + (id * i * 17) % 60}%`,
                                left: `${20 + (id * i * 23) % 60}%`,
                                background: color,
                                boxShadow: `0 0 10px ${color}`
                            }}
                        />
                    ))}
                    <svg className="absolute inset-0 w-full h-full" stroke={color}>
                        <line x1="30%" y1="30%" x2="70%" y2="60%" strokeWidth="1" />
                        <line x1="70%" y1="60%" x2="40%" y2="80%" strokeWidth="1" />
                        <line x1="40%" y1="80%" x2="30%" y2="30%" strokeWidth="1" />
                    </svg>
                </div>
            )}

            {visualConfig.type === "organic" && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div
                        className="w-32 h-32 rounded-full blur-xl animate-pulse"
                        style={{ background: color }}
                    />
                </div>
            )}

            {/* Category Label Overlay */}
            <div className="absolute bottom-4 left-4 text-xs uppercase tracking-widest text-white/40 font-medium">
                {category}
            </div>
        </div>
    );
}
