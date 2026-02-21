"use client"

import React from "react"
import { usePathname } from "next/navigation"
import { DashboardSidebar } from "./DashboardSidebar"
import { AdminHeader, SidebarInset, SidebarProvider } from "@alvarosky/ui"
import type { FeatureKey } from "@/config/sidebar.config"
import { useDashboard } from "@/context/DashboardContext"

interface DashboardShellProps {
    children: React.ReactNode
    features: FeatureKey[]
    tenantName: string
    defaultOpen: boolean
    appName: string
}

export function DashboardShell({ children, features, tenantName, defaultOpen, appName }: DashboardShellProps) {
    const pathname = usePathname()
    const { breadcrumbOverrides } = useDashboard()

    // Generate breadcrumbs with overrides
    const breadcrumbs = React.useMemo(() => {
        const segments = pathname.split('/').filter(Boolean)
        return segments.map((segment, index) => {
            const href = `/${segments.slice(0, index + 1).join('/')}`
            // Use override if available, otherwise format segment
            const label = breadcrumbOverrides[segment] || segment
                .replace(/-/g, ' ')
                .replace(/^./, (c) => c.toUpperCase())

            return { label, href }
        })
    }, [pathname, breadcrumbOverrides])

    return (
        <SidebarProvider defaultOpen={defaultOpen}>
            <DashboardSidebar features={features} tenantName={tenantName} />
            <SidebarInset>
                <AdminHeader appName={appName} breadcrumbs={breadcrumbs} />
                <main className="flex flex-1 flex-col min-h-screen bg-background dark:bg-[#121212]">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider >
    )
}
