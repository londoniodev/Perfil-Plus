import * as React from "react"
import Link from "next/link"
import { Badge } from "./badge"
import { cn } from "./lib/utils"

interface RelatedTopicsProps {
    topics: { id?: string; name: string }[] | string[]
    className?: string
}

export function RelatedTopics({ topics, className }: RelatedTopicsProps) {
    if (!topics?.length) return null

    // Normalize topics to array of strings for display, or objects if needed.
    // Assuming the user might pass objects or strings based on previous context.
    // Let's handle both safely.
    const normalizedTopics = topics.map(t => typeof t === 'string' ? t : t.name);

    return (
        <section className={cn("space-y-3", className)}>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Temas Relacionados
            </h3>
            <div className="flex flex-wrap gap-2">
                {normalizedTopics.map((topic) => (
                    <Link key={topic} href={`/blog?category=${encodeURIComponent(topic)}`}>
                        <Badge variant="secondary" className="hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer px-3 py-1 text-sm">
                            #{topic}
                        </Badge>
                    </Link>
                ))}
            </div>
        </section>
    )
}


