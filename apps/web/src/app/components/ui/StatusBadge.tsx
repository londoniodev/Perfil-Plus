"use client";

import React from "react";

type BadgeVariant = "success" | "warning" | "info" | "purple" | "default";

interface StatusBadgeProps {
    label: string;
    variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, { bg: string; color: string }> = {
    success: { bg: "rgba(34, 197, 94, 0.1)", color: "#22c55e" },
    warning: { bg: "rgba(234, 179, 8, 0.1)", color: "#eab308" },
    info: { bg: "rgba(59, 130, 246, 0.1)", color: "#3b82f6" },
    purple: { bg: "rgba(139, 92, 246, 0.1)", color: "#8b5cf6" },
    default: { bg: "rgba(107, 114, 128, 0.1)", color: "#6b7280" },
};

/**
 * Badge de estado con variantes de color predefinidas.
 */
export default function StatusBadge({ label, variant = "default" }: StatusBadgeProps) {
    const styles = variantStyles[variant];

    return (
        <span
            style={{
                padding: "0.25rem 0.5rem",
                borderRadius: "0.25rem",
                fontSize: "0.75rem",
                fontWeight: 500,
                background: styles.bg,
                color: styles.color,
                whiteSpace: "nowrap",
            }}
        >
            {label}
        </span>
    );
}
