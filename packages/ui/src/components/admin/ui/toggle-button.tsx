"use client";

import React from "react";
import { Star, Check, Eye, EyeOff } from "lucide-react";
import { cn } from "../../../lib/utils";

// ============================================
// Types
// ============================================
export interface ToggleButtonProps {
    active: boolean;
    onClick: () => void;
    label: string;
    activeColor?: string;
    icon: React.ReactNode;
    activeIcon?: React.ReactNode;
    className?: string;
}

// ============================================
// Component
// ============================================
/**
 * Reusable toggle button with active/inactive visual states.
 * Used for states like Premium/Published.
 */
export function ToggleButton({
    active,
    onClick,
    label,
    activeColor = "#8b5cf6", // violet-500
    icon,
    activeIcon,
    className
}: ToggleButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-md border transition-colors text-sm font-medium",
                className
            )}
            style={{
                backgroundColor: active ? `${activeColor}26` : "transparent", // 15% opacity
                borderColor: active ? activeColor : "hsl(var(--border))",
                color: active ? activeColor : "hsl(var(--muted-foreground))",
            }}
        >
            {active && activeIcon ? activeIcon : icon}
            <span>{label}</span>
        </button>
    );
}

// ============================================
// Preset Icons
// ============================================
export const PremiumIcon = ({ filled = false, color = "currentColor" }: { filled?: boolean; color?: string }) => (
    <Star
        fill={filled ? color : "none"}
        color={color}
        size={18}
    />
);

export const PublishIcon = ({ published = false }: { published?: boolean }) => (
    published ? <Check color="#22c55e" size={18} /> : <EyeOff size={18} />
);
