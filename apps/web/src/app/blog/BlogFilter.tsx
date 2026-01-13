"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Category } from "@/lib/types";
import { IconChevronDown } from "../components/icons";
import styles from "./blog.module.css";

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
        <div className={styles.filterContainer} ref={dropdownRef}>
            <button
                className={`${styles.dropdownTrigger} ${isOpen ? styles.open : ""}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                <span className={styles.triggerLabel}>
                    {activeCategory ? "Tema: " : ""}{activeLabel}
                </span>
                <IconChevronDown className={`${styles.chevron} ${isOpen ? styles.rotate : ""}`} />
            </button>

            <div className={`${styles.dropdownMenu} ${isOpen ? styles.show : ""}`}>
                <div className={styles.dropdownContent}>
                    <Link
                        href="/blog"
                        className={`${styles.dropdownItem} ${!activeCategory ? styles.active : ""}`}
                        onClick={() => setIsOpen(false)}
                    >
                        Todos los temas
                    </Link>
                    {categories.map((category) => (
                        <Link
                            key={category.id}
                            href={`/blog?category=${category.slug}`}
                            className={`${styles.dropdownItem} ${activeCategory === category.slug ? styles.active : ""}`}
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
