"use client";

import { useRouter } from "next/navigation";
import { FloatingBackButton as SharedFloatingBackButton } from "@alvarosky/ui";

interface FloatingBackButtonProps {
    className?: string;
}

export function FloatingBackButton({ className }: FloatingBackButtonProps) {
    const router = useRouter();

    return (
        <SharedFloatingBackButton
            className={`bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-[0_0_20px_rgba(217,70,239,0.5)] hover:shadow-[0_0_30px_rgba(217,70,239,0.8)] border-fuchsia-400/20 transition-all duration-300 ${className}`}
            onClick={() => router.push('/')}
        />
    );
}
