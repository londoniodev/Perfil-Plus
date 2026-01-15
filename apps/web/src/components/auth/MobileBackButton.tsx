"use client";

import { useRouter } from "next/navigation";
import { IconBack } from "@/components/ui/Icons";
import { Button } from "@/components/ui/Button";

export function MobileBackButton() {
    const router = useRouter();

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/')}
            className="md:hidden"
            aria-label="Volver al inicio"
        >
            <IconBack size={20} />
        </Button>
    );
}
