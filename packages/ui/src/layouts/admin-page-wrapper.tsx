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
    PageHeader,
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
                <div className="space-y-4">
                    {/* Breadcrumbs (Only if explicitely provided) */}
                    {breadcrumbs && breadcrumbs.length > 0 && (
                        <Breadcrumb className="justify-center">
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

                    {/* Standardized Page Header (Centered) */}
                    {(title || actions) && (
                        <PageHeader
                            title={title || ""}
                            description={description}
                        >
                            {actions}
                        </PageHeader>
                    )}
                </div>
            )}

            {/* Page Content */}
            {children}
        </div>
    );
}
