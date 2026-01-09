"use client";

import { useMemo } from "react";

interface CaseVisualProps {
    category: string;
    color: string;
    id: number;
}

export function CaseVisual({ category, color, id }: CaseVisualProps) {
    // Generar configuración visual determinista basada en el ID
    const visualConfig = useMemo(() => {
        const seed = id * 137; // Simple seed
        const getType = () => {
            if (category === "Empresas") return "structural";
            if (category === "Explora") return "flow";
            if (category === "Liderazgo") return "connections";
            return "organic"; // Bienestar / Default
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

    // Styles for animations
    const pulseAnim = "animate-pulse-slow"; // Assumes custom animation or standard pulse

    return (
        <div
            className="case-visual-container"
            style={{
                width: "100%",
                height: "100%",
                minHeight: "400px", // Altura mínima en mobile
                background: `linear-gradient(135deg, ${color}10 0%, rgba(0,0,0,0) 100%)`,
                borderRadius: "2rem",
                overflow: "hidden",
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `1px solid ${color}20`,
                backdropFilter: "blur(20px)"
            }}
        >
            {/* Background noise texture effect */}
            <div style={{
                position: "absolute",
                inset: 0,
                backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E\")",
                opacity: 0.4,
                mixBlendMode: "overlay"
            }} />

            {/* Abstract Shapes based on type */}

            {visualConfig.type === "structural" && (
                <div style={{ position: "relative", width: "300px", height: "300px", transform: `rotate(${visualConfig.rotation}deg)` }}>
                    {/* Architectural Blocks */}
                    <div style={{
                        position: "absolute",
                        top: "10%", left: "10%",
                        width: "60%", height: "60%",
                        border: `2px solid ${color}`,
                        opacity: 0.3
                    }} />
                    <div style={{
                        position: "absolute",
                        bottom: "10%", right: "10%",
                        width: "50%", height: "50%",
                        background: color,
                        opacity: 0.1
                    }} />
                    <div style={{
                        position: "absolute",
                        top: "30%", right: "20%",
                        width: "20%", height: "60%",
                        border: `1px dashed ${color}`,
                        opacity: 0.5
                    }} />
                </div>
            )}

            {visualConfig.type === "flow" && (
                <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {/* Concentric Circles / Radar */}
                    {[1, 2, 3].map((i) => (
                        <div key={i} style={{
                            position: "absolute",
                            width: `${200 + i * 80}px`,
                            height: `${200 + i * 80}px`,
                            borderRadius: "50%",
                            border: `1px solid ${color}`,
                            opacity: 0.4 - (i * 0.1),
                            // animation: `spin ${20 + i * 5}s linear infinite` // CSS animation needs class or keyframes injection
                            transform: `scale(${visualConfig.scale})`
                        }} />
                    ))}
                    <div style={{
                        width: "100px",
                        height: "100px",
                        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
                        opacity: 0.6,
                        filter: "blur(20px)"
                    }} />
                </div>
            )}

            {visualConfig.type === "connections" && (
                <div style={{ position: "relative", width: "300px", height: "300px" }}>
                    {/* Nodes and Links */}
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} style={{
                            position: "absolute",
                            top: `${20 + (id * i * 17) % 60}%`,
                            left: `${20 + (id * i * 23) % 60}%`,
                            width: "12px",
                            height: "12px",
                            background: color,
                            borderRadius: "50%",
                            boxShadow: `0 0 10px ${color}`
                        }} />
                    ))}
                    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.3 }} stroke={color}>
                        <line x1="30%" y1="30%" x2="70%" y2="60%" strokeWidth="1" />
                        <line x1="70%" y1="60%" x2="40%" y2="80%" strokeWidth="1" />
                        <line x1="40%" y1="80%" x2="30%" y2="30%" strokeWidth="1" />
                    </svg>
                </div>
            )}
            {visualConfig.type === "organic" && (
                <div style={{ position: "relative" }}>
                    <div style={{
                        width: "250px", height: "250px",
                        background: color,
                        borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%",
                        opacity: 0.1,
                        filter: "blur(40px)",
                        animation: "float 6s ease-in-out infinite"
                    }} />
                </div>
            )}

            {/* Category Label Overlay */}
            <div style={{
                position: "absolute",
                bottom: "2rem",
                left: "2rem",
                fontSize: "3rem",
                fontWeight: 900,
                color: "rgba(255,255,255,0.05)",
                textTransform: "uppercase",
                pointerEvents: "none"
            }}>
                {category}
            </div>
        </div>
    );
}
