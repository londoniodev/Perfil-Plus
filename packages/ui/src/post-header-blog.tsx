import * as React from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { cn } from "./lib/utils"
// Assuming AdaptiveImage is exported from index or available in same directory. 
// If it's in the same dir, use "./adaptive-image".
import { AdaptiveImage } from "./adaptive-image"
import { ShareButtons } from "./share-buttons"

interface BreadcrumbItem {
    label: string
    href: string
}

interface PostHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    title: string
    breadcrumbs?: BreadcrumbItem[]
    author: {
        name: string
        image?: string
    }
    date: string | Date
    readTime?: string
    shareUrl?: string
}

export function PostHeader({
    title,
    breadcrumbs,
    author,
    date,
    readTime,
    shareUrl,
    className,
    ...props
}: PostHeaderProps) {
    const formattedDate = date instanceof Date
        ? date.toLocaleDateString("es-CO", { day: 'numeric', month: 'long', year: 'numeric' })
        : new Date(date).toLocaleDateString("es-CO", { day: 'numeric', month: 'long', year: 'numeric' })

    return (
        <header className={cn("space-y-6 border-b border-border pb-8 mb-8", className)} {...props}>
            {/* 1. Breadcrumbs */}
            {breadcrumbs && (
                <nav className="flex items-center justify-center text-sm text-muted-foreground flex-wrap gap-y-2">
                    {breadcrumbs.map((item, index) => (
                        <React.Fragment key={item.href}>
                            {index > 0 && <ChevronRight className="h-4 w-4 mx-2" />}
                            <Link
                                href={item.href}
                                className={cn("hover:text-foreground transition-colors",
                                    index === breadcrumbs.length - 1 && "text-foreground font-medium pointer-events-none"
                                )}
                            >
                                {item.label}
                            </Link>
                        </React.Fragment>
                    ))}
                </nav>
            )}

            {/* 2. Título */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-balance text-foreground text-center">
                {title}
            </h1>

            {/* 3. Metadata (Autor & Info) */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                    <div className="relative h-8 w-8 overflow-hidden rounded-full border border-border">
                        <AdaptiveImage
                            src={author.image || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&q=80"}
                            alt={author.name}
                            aspectRatio="square"
                            className="h-full w-full object-cover"
                        />
                    </div>
                    <span className="font-medium text-foreground">{author.name}</span>
                </div>

                <span className="hidden sm:inline">•</span>
                <time dateTime={date instanceof Date ? date.toISOString() : date}>{formattedDate}</time>

                {readTime && (
                    <>
                        <span className="hidden sm:inline">•</span>
                        <span>{readTime} de lectura</span>
                    </>
                )}

                {shareUrl && (
                    <>
                        <span className="hidden sm:inline mx-2 border-l border-border h-4"></span>
                        <ShareButtons url={shareUrl} title={title} className="scale-90 origin-left" />
                    </>
                )}
            </div>
        </header>
    )
}
