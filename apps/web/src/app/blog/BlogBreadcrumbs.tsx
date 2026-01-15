"use client";

import Link from "next/link";

export function BlogBreadcrumbs() {
    return (
        <nav className="flex items-center text-sm text-foreground-muted mb-6 overflow-x-auto whitespace-nowrap">
            <Link
                href="/"
                className="hover:text-primary hover:underline underline-offset-4 transition-colors"
            >
                Inicio
            </Link>
            <span className="mx-2 opacity-50">›</span>
            <Link
                href="/blog"
                className="hover:text-primary hover:underline underline-offset-4 transition-colors"
            >
                Blog
            </Link>
            <span className="mx-2 opacity-50">›</span>
            <span className="text-foreground font-medium truncate max-w-[200px] sm:max-w-none">
                Este artículo
            </span>
        </nav>
    );
}
