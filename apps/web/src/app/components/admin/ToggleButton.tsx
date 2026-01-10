"use client";

import React from "react";

interface ToggleButtonProps {
    active: boolean;
    onClick: () => void;
    label: string;
    activeColor?: string;
    icon: React.ReactNode;
    activeIcon?: React.ReactNode;
}

/**
 * Botón toggle reutilizable con estilo visual activo/inactivo.
 * Usado para estados como Premium/Publicado.
 */
export default function ToggleButton({
    active,
    onClick,
    label,
    activeColor = "#8b5cf6",
    icon,
    activeIcon,
}: ToggleButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 1rem",
                background: active ? `${activeColor}26` : "transparent",
                border: active ? `1px solid ${activeColor}` : "1px solid var(--border)",
                borderRadius: "0.5rem",
                cursor: "pointer",
                color: active ? activeColor : "var(--foreground-muted)",
                transition: "all 0.2s",
            }}
        >
            {active && activeIcon ? activeIcon : icon}
            <span style={{ fontWeight: 500 }}>{label}</span>
        </button>
    );
}

// Iconos predefinidos para uso común
export const PremiumIcon = ({ filled = false, color = "currentColor" }: { filled?: boolean; color?: string }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? color : "none"} stroke="currentColor" strokeWidth="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
);

export const PublishIcon = ({ published = false }: { published?: boolean }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        {published ? (
            <>
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" fill="#22c55e" />
            </>
        ) : (
            <>
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                <line x1="1" y1="1" x2="23" y2="23" />
            </>
        )}
    </svg>
);
