"use client"

import { useEffect } from "react"
import { useDashboard } from "@/context/DashboardContext"

interface BreadcrumbSetterProps {
    segment: string
    label: string
}

export function BreadcrumbSetter({ segment, label }: BreadcrumbSetterProps) {
    const { setBreadcrumb } = useDashboard()

    useEffect(() => {
        setBreadcrumb(segment, label)
        // No cleanup needed as we want it to persist during navigation if we go deeper
        // but maybe we should cleanup if we unmount?
        // Actually, overriding just matching segment is safe.
    }, [segment, label, setBreadcrumb])

    return null
}
