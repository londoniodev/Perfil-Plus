"use client";

import Link from "next/link";
import { IconBack as IconArrowLeft } from "@alvarosky/ui";
import { Button } from "@alvarosky/ui";

export function BlogBackButton() {
    return (
        <div className="mb-8">
            <Button
                variant="ghost"
                size="sm"
                className="pl-0 text-foreground-muted hover:text-foreground transition-colors group"
                asChild
            >
                <Link href="/blog" aria-label="Volver al blog">
                    <IconArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    Volver al blog
                </Link>
            </Button>
        </div>
    );
}

