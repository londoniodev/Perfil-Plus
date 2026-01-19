"use client"

import * as React from "react"
import { cn } from "./lib/utils"

export interface TocItem {
    title: string
    url: string // Ej: "#introduccion"
    level: number // 1 (h1), 2 (h2), 3 (h3)
}

interface TableOfContentsProps {
    items: TocItem[]
    className?: string
}

export function TableOfContents({ items, className }: TableOfContentsProps) {
    if (!items?.length) return null

    // Estado para detectar la sección activa
    const [activeId, setActiveId] = React.useState<string>("")

    React.useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id)
                    }
                })
            },
            { rootMargin: "0px 0px -80% 0px" }
        )

        items.forEach((item) => {
            const id = item.url.replace("#", "")
            const element = document.getElementById(id)
            if (element) observer.observe(element)
        })

        return () => observer.disconnect()
    }, [items])

    return (
        <nav className={cn("space-y-2", className)}>
            <p className="font-medium text-sm text-foreground mb-4">En este artículo</p>
            <ul className="space-y-2 text-sm">
                {items.map((item) => (
                    <li
                        key={item.url}
                        style={{ paddingLeft: `${(item.level - 2) * 12}px` }} // Indentación dinámica
                    >
                        <a
                            href={item.url}
                            onClick={(e) => {
                                e.preventDefault()
                                const id = item.url.replace("#", "")
                                const element = document.getElementById(id)
                                if (element) {
                                    element.scrollIntoView({ behavior: 'smooth' });
                                    setActiveId(id);
                                }
                            }}
                            className={cn(
                                "block transition-colors hover:text-foreground line-clamp-1 border-l-2 pl-2 -ml-[2px]",
                                item.url === `#${activeId}` || activeId === item.url.replace("#", "")
                                    ? "text-primary font-medium border-primary"
                                    : "text-muted-foreground border-transparent hover:border-border"
                            )}
                        >
                            {item.title}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    )
}


