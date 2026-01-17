"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Category } from "@/types/blog";
import { IconChevronDown } from "@mauromera/ui";

interface BlogFilterProps {
    categories: Category[];
    activeCategory?: string;
}

export function BlogFilter({ categories, activeCategory }: BlogFilterProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const activeCategoryData = categories.find((c) => c.slug === activeCategory);
    const activeLabel = activeCategoryData ? activeCategoryData.name : "Todos los temas";

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="relative inline-block text-left mb-8 z-20" ref={dropdownRef}>
            <button
                className={`
                    flex items-center justify-between gap-3 min-w-[200px]
                    px-4 py-3 
                    bg-card border border-border rounded-xl shadow-sm 
                    hover:border-primary/50 hover:shadow-md transition-all duration-200
                    active:scale-95
                    ${isOpen ? 'ring-2 ring-primary/20 border-primary' : ''}
                `}
                onClick={() => setIsOpen(!isOpen)}
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                <span className="text-sm font-medium text-foreground truncate">
                    {activeCategory ? <span className="text-foreground-muted font-normal">Tema: </span> : ""}{activeLabel}
                </span>
                <IconChevronDown className={`w-4 h-4 text-foreground-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <div className={`
                absolute left-0 mt-2 w-64 origin-top-left
                bg-card border border-border rounded-xl shadow-xl
                z-30 backdrop-blur-xl
                transition-all duration-200 ease-in-out
                ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}
            `}>
                <div className="p-2 space-y-1">
                    <Link
                        href="/blog"
                        className={`
                            block px-3 py-2.5 text-sm rounded-lg transition-colors
                            ${!activeCategory
                                ? 'bg-primary text-primary-foreground font-medium'
                                : 'text-foreground hover:bg-accent hover:text-accent-foreground'}
                        `}
                        onClick={() => setIsOpen(false)}
                    >
                        Todos los temas
                    </Link>
                    {categories.map((category) => (
                        <Link
                            key={category.id}
                            href={`/blog?category=${category.slug}`}
                            className={`
                                block px-3 py-2.5 text-sm rounded-lg transition-colors
                                ${activeCategory === category.slug
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-foreground hover:bg-accent hover:text-accent-foreground'}
                            `}
                            onClick={() => setIsOpen(false)}
                        >
                            {category.name}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
