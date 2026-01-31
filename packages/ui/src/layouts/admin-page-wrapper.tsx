"use client";

import * as React from "react";
import Link from "next/link";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "../index";

// ============================================================================
// TYPES
// ============================================================================

export interface AdminPageBreadcrumb {
    label: string;
    href?: string;
}

export interface AdminPageWrapperProps {
    /** Page title - displayed as h1 */
    title?: string;
    /** Page description */
    description?: string;
    /** Breadcrumb trail */
    breadcrumbs?: AdminPageBreadcrumb[];
    /** Actions to display in header (buttons, etc.) */
    actions?: React.ReactNode;
    /** Page content */
    children: React.ReactNode;
    /** Custom class for wrapper */
    className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function AdminPageWrapper({
    title,
    description,
    breadcrumbs,
    actions,
    children,
    className,
}: AdminPageWrapperProps) {
    return (
        <div className={`flex flex-1 flex-col gap-4 p-4 pt-0 ${className || ""}`}>
            {/* Page Header with Breadcrumbs */}
            {(breadcrumbs || title) && (
                <div className="space-y-2">
                    {/* Breadcrumbs */}
                    {breadcrumbs && breadcrumbs.length > 0 && (
                        <Breadcrumb>
                            <BreadcrumbList>
                                {breadcrumbs.map((item, index) => {
                                    const isLast = index === breadcrumbs.length - 1;
                                    return (
                                        <React.Fragment key={item.label}>
                                            <BreadcrumbItem>
                                                {isLast || !item.href ? (
                                                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                                                ) : (
                                                    <BreadcrumbLink asChild>
                                                        <Link href={item.href}>{item.label}</Link>
                                                    </BreadcrumbLink>
                                                )}
                                            </BreadcrumbItem>
                                            {!isLast && <BreadcrumbSeparator />}
                                        </React.Fragment>
                                    );
                                })}
                            </BreadcrumbList>
                        </Breadcrumb>
                    )}

                    {/* Title and Actions Row */}
                    {(title || actions) && (
                        <div className="flex items-center justify-between">
                            <div>
                                {title && (
                                    <h1 className="text-2xl font-bold tracking-tight">
                                        {title}
                                    </h1>
                                )}
                                {description && (
                                    <p className="text-muted-foreground text-sm mt-1">
                                        {description}
                                    </p>
                                )}
                            </div>
                            {actions && (
                                <div className="flex items-center gap-2">
                                    {actions}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Page Content */}
            {children}
        </div>
    );
}
