"use client";

import React from "react";

type BadgeVariant = "success" | "warning" | "info" | "purple" | "default";

interface StatusBadgeProps {
    label: string;
    variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
    success: "badge-success",
    warning: "badge-warning",
    info: "badge-info",
    purple: "badge-purple",
    default: "badge-default",
};

/**
 * Badge de estado con variantes de color predefinidas.
 */
export default function StatusBadge({ label, variant = "default" }: StatusBadgeProps) {
    return (
        <span className={`badge-status ${variantClasses[variant]}`}>
            {label}
        </span>
    );
}
