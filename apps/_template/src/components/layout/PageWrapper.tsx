"use client";

import Link from "next/link";
import { Separator } from "@alvarosky/ui";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@alvarosky/ui";
import { SidebarTrigger } from "@alvarosky/ui";
import { cn } from "@alvarosky/ui/lib/utils";

export interface BreadcrumbItemType {
    label: string;
    href?: string;
}

interface PageWrapperProps {
    children: React.ReactNode;
    title: string;
    description?: string;
    breadcrumbs?: BreadcrumbItemType[];
    maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "full";
    className?: string;
}

const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    "6xl": "max-w-6xl",
    "7xl": "max-w-7xl",
    full: "max-w-full",
};

/**
 * PageWrapper - Wrapper for dashboard pages with breadcrumbs and constrained content
 *
 * Features:
 * - Breadcrumb navigation
 * - Constrained content width (max-w-2xl by default)
 * - Left-aligned content
 * - Consistent spacing
 */
export function PageWrapper({
    children,
    title,
    description,
    breadcrumbs = [],
    maxWidth = "2xl",
    className = "",
}: PageWrapperProps) {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Top Bar with Breadcrumbs */}
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
            </header>

            {/* Content Area - Constrained & Left-Aligned */}
            <div className={cn("flex-1 px-4 py-6 lg:px-8 lg:py-8", className)}>
                <div className={cn(maxWidthClasses[maxWidth], "space-y-8")}>
                    {/* Page Header */}
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                        {description && (
                            <p className="text-muted-foreground">{description}</p>
                        )}
                    </div>

                    <Separator />

                    {/* Page Content */}
                    <div className="space-y-6">{children}</div>
                </div>
            </div>
        </div>
    );
}
