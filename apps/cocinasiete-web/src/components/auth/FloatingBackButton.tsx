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
            className={className}
            onClick={() => router.push('/')}
        />
    );
}
