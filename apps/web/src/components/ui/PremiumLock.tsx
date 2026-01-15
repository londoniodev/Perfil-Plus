"use client";

import Link from "next/link";
import { IconLock } from "@/components/ui/Icons";
import { Button } from "@/components/ui/Button";

interface PremiumLockProps {
    title: string;
    description: string;
    actionHref: string;
    actionText: string;
    icon?: React.ReactNode;
}

export default function PremiumLock({
    title,
    description,
    actionHref,
    actionText,
    icon
}: PremiumLockProps) {
    return (
        <div className="flex flex-col items-center justify-center text-center p-8 bg-muted/30 border border-border rounded-lg space-y-6 max-w-2xl mx-auto">
            <div className="text-primary w-20 h-20 bg-primary/10 flex items-center justify-center rounded-full mb-2">
                {icon || <IconLock size={40} />}
            </div>
            <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">{description}</p>
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href={actionHref}>{actionText}</Link>
            </Button>
        </div>
    );
}
