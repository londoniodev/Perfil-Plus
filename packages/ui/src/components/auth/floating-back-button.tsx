"use client";

import React from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "../../button";
import { cn } from "../../lib/utils";

// ============================================
// Types
// ============================================
export interface FloatingBackButtonProps {
    className?: string;
    onClick?: () => void;
    /** URL to navigate to. If not provided, uses onClick */
    href?: string;
    /** Color scheme */
    variant?: "gold" | "default";
}

// ============================================
// Component
// ============================================
export function FloatingBackButton({
    className,
    onClick,
    variant = "default"
}: FloatingBackButtonProps) {
    const colorClasses = variant === "gold"
        ? "bg-[#e8a838] hover:bg-[#d6982d] text-black"
        : "bg-primary hover:bg-primary/90 text-primary-foreground";

    return (
        <Button
            size="icon"
            onClick={onClick}
            className={cn(
                "absolute top-8 left-8 z-50",
                colorClasses,
                "rounded-full shadow-lg hover:shadow-xl",
                "transition hover:-translate-y-0.5 hover:scale-105",
                "border border-white/10",
                className
            )}
            aria-label="Volver al inicio"
        >
            <ArrowLeft className="w-5 h-5" />
        </Button>
    );
}
