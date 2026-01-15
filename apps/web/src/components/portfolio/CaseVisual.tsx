"use client";

import { useMemo } from "react";
import styles from "@/styles/portfolio.module.css";

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

    return (
        <div
            className={styles.visualContainer}
            style={{
                background: `linear-gradient(135deg, ${color}10 0%, rgba(0,0,0,0) 100%)`,
                border: `1px solid ${color}20`,
            }}
        >
            {/* Background noise texture effect */}
            <div className={styles.noiseTexture} />

            {/* Abstract Shapes based on type */}

            {visualConfig.type === "structural" && (
                <div className={styles.structuralContainer} style={{ transform: `rotate(${visualConfig.rotation}deg)` }}>
                    {/* Architectural Blocks */}
                    <div
                        className={styles.blockMain}
                        style={{ border: `2px solid ${color}` }}
                    />
                    <div
                        className={styles.blockSecondary}
                        style={{ background: color }}
                    />
                    <div
                        className={styles.blockDashed}
                        style={{ border: `1px dashed ${color}` }}
                    />
                </div>
            )}

            {visualConfig.type === "flow" && (
                <div className={styles.flowContainer}>
                    {/* Concentric Circles / Radar */}
                    {[1, 2, 3].map((i) => (
                        <div key={i}
                            className={styles.radarCircle}
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
                        className={styles.flowCore}
                        style={{
                            background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
                        }}
                    />
                </div>
            )}

            {visualConfig.type === "connections" && (
                <div className={styles.connectionsContainer}>
                    {/* Nodes and Links */}
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i}
                            className={styles.node}
                            style={{
                                top: `${20 + (id * i * 17) % 60}%`,
                                left: `${20 + (id * i * 23) % 60}%`,
                                background: color,
                                boxShadow: `0 0 10px ${color}`
                            }}
                        />
                    ))}
                    <svg className={styles.connectionsSvg} stroke={color}>
                        <line x1="30%" y1="30%" x2="70%" y2="60%" strokeWidth="1" />
                        <line x1="70%" y1="60%" x2="40%" y2="80%" strokeWidth="1" />
                        <line x1="40%" y1="80%" x2="30%" y2="30%" strokeWidth="1" />
                    </svg>
                </div>
            )}
            {visualConfig.type === "organic" && (
                <div className={styles.organicContainer}>
                    <div
                        className={styles.organicShape}
                        style={{ background: color }}
                    />
                </div>
            )}

            {/* Category Label Overlay */}
            <div className={styles.categoryLabel}>
                {category}
            </div>
        </div>
    );
}
