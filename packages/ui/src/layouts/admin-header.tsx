"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
SidebarTrigger,
} from "../sidebar";
import { Separator } from "../separator";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "../breadcrumb";

// ============================================================================
// TYPES
// ============================================================================

export interface AdminBreadcrumbItem {
    label: string;
    href?: string; // If not provided, treated as current page
}

export interface AdminHeaderProps {
    /** Application or tenant name displayed in header */
    appName?: string;
    /** Breadcrumb items for navigation */
    breadcrumbs?: AdminBreadcrumbItem[];
    /** Additional content to render in the header (e.g., search, actions) */
    children?: React.ReactNode;
    /** Custom class for the header */
    className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function AdminHeader({
    appName,
    breadcrumbs,
    children,
    className,
}: AdminHeaderProps) {
    const pathname = usePathname() || "";

    // Auto-generate breadcrumbs if not provided
    const items = React.useMemo(() => {
        if (breadcrumbs) return breadcrumbs;

        // Skip breadcrumbs on root or dashboard home if desired
        // For admin, usually /admin is home.

        const segments = pathname.split('/').filter(Boolean);
        // e.g. ['admin', 'products', 'new']

        return segments.map((segment: string, index: number) => {
            const href = `/${segments.slice(0, index + 1).join('/')}`;
            // Capitalize and format label
            const label = segment
                .replace(/-/g, ' ')
                .replace(/^./, (c: string) => c.toUpperCase());

            return {
                label,
                href
            };
        });
    }, [breadcrumbs, pathname]);

    return (
        <header
            className={`
                flex h-16 shrink-0 items-center gap-2 
                transition-[width,height] ease-linear 
                group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 
                border-b border-sidebar-border/50 
                bg-background/50 backdrop-blur-xl 
                px-4 sticky top-0 z-10 w-full
                ${className || ""}
            `.trim()}
        >
            {/* Sidebar Toggle */}
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />

            {/* Breadcrumbs or App Name */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
                {items && items.length > 0 ? (
                    <Breadcrumb>
                        <BreadcrumbList>
                            {items.map((item: AdminBreadcrumbItem, index: number) => {
                                const isLast = index === items.length - 1;
                                return (
                                    <React.Fragment key={item.href || item.label}>
                                        <BreadcrumbItem>
                                            {isLast ? (
                                                <BreadcrumbPage className="truncate capitalize">
                                                    {item.label}
                                                </BreadcrumbPage>
                                            ) : (
                                                <BreadcrumbLink asChild>
                                                    <Link href={item.href || "#"} className="capitalize">{item.label}</Link>
                                                </BreadcrumbLink>
                                            )}
                                        </BreadcrumbItem>
                                        {!isLast && <BreadcrumbSeparator />}
                                    </React.Fragment>
                                );
                            })}
                        </BreadcrumbList>
                    </Breadcrumb>
                ) : appName ? (
                    <span className="text-sm font-medium text-muted-foreground truncate">
                        {appName}
                    </span>
                ) : null}
            </div>

            {/* Additional Actions (search, notifications, etc.) */}
            {children && (
                <div className="flex items-center gap-2 ml-auto">
                    {children}
                </div>
            )}
        </header>
    );
}
