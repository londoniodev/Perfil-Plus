"use client";

import { useRouter } from "next/navigation";
import { IconBack } from "@/components/ui/Icons";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface FloatingBackButtonProps {
    className?: string;
}

export function FloatingBackButton({ className }: FloatingBackButtonProps) {
    const router = useRouter();

    return (
        <Button
            size="icon"
            onClick={() => router.push('/')}
            className={cn(
                "absolute top-8 left-8 z-50",
                "bg-[#e8a838] hover:bg-[#d6982d] text-black", // Gold/Orange color manually or via var
                "rounded-full shadow-lg hover:shadow-xl",
                "transition-all hover:-translate-y-0.5 hover:scale-105",
                "border border-white/10",
                className
            )}
            aria-label="Volver al inicio"
        >
            <IconBack className="w-5 h-5" />
        </Button>
    );
}
