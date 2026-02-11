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
            className={`text-fuchsia-500 hover:text-fuchsia-400 hover:bg-fuchsia-500/10 border-fuchsia-500/20 ${className}`}
            onClick={() => router.push('/')}
        />
    );
}
