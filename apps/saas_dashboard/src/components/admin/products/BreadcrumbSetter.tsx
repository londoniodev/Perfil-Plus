"use client"

import { useEffect } from "react"
import { useDashboard } from "@/context/DashboardContext"

/**
 * Client component that sets a breadcrumb override for a dynamic segment.
 * Used in Server Components (pages) to display human-readable labels
 * instead of raw IDs in breadcrumbs.
 */
export function BreadcrumbSetter({ segment, label }: { segment: string; label: string }) {
    const { setBreadcrumb } = useDashboard()

    useEffect(() => {
        setBreadcrumb(segment, label)
    }, [segment, label, setBreadcrumb])

    return null
}
