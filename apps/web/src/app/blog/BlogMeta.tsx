"use client";

import { useState } from "react";
import Link from 'next/link';
import { IconChevronDown } from "@/components/ui/Icons";
import { Category } from "@/types/blog";

interface BlogMetaProps {
    date: string;
    readingTime?: number;
    category?: Category;
}

export function BlogMeta({ date, readingTime, category }: BlogMetaProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    // Format date: DD/MM/AA
    const formatDate = (dateString: string) => {
        try {
            const d = new Date(dateString);
            const day = d.getDate().toString().padStart(2, '0');
            const month = (d.getMonth() + 1).toString().padStart(2, '0');
            const year = d.getFullYear().toString().slice(-2);
            return `${day}/${month}/${year}`; // DD/MM/AA
        } catch {
            return dateString;
        }
    };

    return (
        <div className="relative inline-block">
            {/* Mobile Toggle (Hidden on desktop if desired, or keep logic) */}
            <div className="md:hidden">
                <button
                    className={`flex items-center gap-1 text-sm text-foreground-muted hover:text-foreground transition-colors ${isExpanded ? 'text-primary' : ''}`}
                    onClick={() => setIsExpanded(!isExpanded)}
                    aria-label="Ver detalles del artículo"
                >
                    INFO <IconChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
            </div>

            {/* Content - Always visible on desktop, toggle on mobile */}
            <div className={`
                mt-2 md:mt-0 
                flex flex-col md:flex-row md:items-center gap-3 md:gap-6 
                text-sm text-foreground-muted
                ${isExpanded ? 'block' : 'hidden md:flex'}
            `}>
                {category && (
                    <div className="flex items-center gap-2">
                        <span className="opacity-70">Categoría:</span>
                        <Link
                            href={`/blog?category=${category.slug}`}
                            className="font-medium text-primary hover:text-primary-light hover:underline transition-colors"
                        >
                            {category.name}
                        </Link>
                    </div>
                )}

                <div className="flex items-center gap-2">
                    <span className="opacity-70">Fecha:</span>
                    <span className="font-medium text-foreground">{formatDate(date)}</span>
                </div>

                {readingTime && (
                    <div className="flex items-center gap-2">
                        <span className="opacity-70">Tiempo:</span>
                        <span className="flex items-center gap-1">
                            <span>📖</span> {readingTime} mins
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
