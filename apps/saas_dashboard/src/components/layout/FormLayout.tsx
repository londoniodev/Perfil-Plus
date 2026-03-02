"use client"

import { ReactNode } from "react"
import Link from "next/link"
import { Separator, SidebarTrigger, Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from "@alvarosky/ui"
import { cn } from "@alvarosky/ui/lib/utils"

interface BreadcrumbItemType {
    label: string
    href?: string
}

interface FormLayoutProps {
    children: ReactNode
    title: string
    description?: string
    breadcrumbs?: BreadcrumbItemType[]
    maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "full"
    actions?: ReactNode
}

const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    full: "max-w-full",
}

const EMPTY_BREADCRUMBS: BreadcrumbItemType[] = []

/**
 * FormLayout - Specialized layout for forms and settings pages
 * 
 * Follows Shadcn Playground pattern:
 * - Constrained width (forms never stretch full screen)
 * - Left-aligned content
 * - Breadcrumb navigation
 * - Optional actions slot in header
 */
export function FormLayout({
    children,
    title,
    description,
    breadcrumbs = EMPTY_BREADCRUMBS,
    maxWidth = "2xl",
    actions,
}: FormLayoutProps) {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Sticky Header with Breadcrumbs */}
            <header className="flex h-14 lg:h-[60px] shrink-0 items-center gap-2 border-b bg-background px-4 lg:px-6 sticky top-0 z-10">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem className="hidden md:block">
                            <BreadcrumbLink asChild>
                                <Link href="/perfil">Dashboard</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        {breadcrumbs.map((crumb, index) => (
                            <span key={crumb.label} className="contents">
                                <BreadcrumbSeparator className="hidden md:block" />
                                <BreadcrumbItem>
                                    {index === breadcrumbs.length - 1 ? (
                                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                                    ) : (
                                        <BreadcrumbLink asChild>
                                            <Link href={crumb.href || "#"}>{crumb.label}</Link>
                                        </BreadcrumbLink>
                                    )}
                                </BreadcrumbItem>
                            </span>
                        ))}
                    </BreadcrumbList>
                </Breadcrumb>
                {actions && (
                    <div className="ml-auto flex items-center gap-2">
                        {actions}
                    </div>
                )}
            </header>

            {/* Content: Left-aligned, Constrained Width */}
            <div className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
                <div className={cn(maxWidthClasses[maxWidth], "space-y-8")}>
                    {/* Page Title */}
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                        {description && (
                            <p className="text-muted-foreground text-sm">{description}</p>
                        )}
                    </div>

                    <Separator />

                    {/* Form Content with breathing room */}
                    <div className="space-y-8">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    )
}
