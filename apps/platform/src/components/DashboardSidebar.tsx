"use client"

import { AdminSidebar } from "@alvarosky/ui"
import { LogoutButton } from "@/components/logout-button"
import { getPlatformSections, type TenantItem } from "@/config/sidebar.config"

// ============================================================================
// TYPES
// ============================================================================

interface DashboardSidebarProps {
    tenants: TenantItem[];
}

// ============================================================================
// CLIENT WRAPPER
// Thin wrapper for Platform sidebar with logout
// ============================================================================

export function DashboardSidebar({ tenants }: DashboardSidebarProps) {
    // Get navigation sections with dynamic tenants
    const sections = getPlatformSections(tenants)

    // Brand configuration for Platform
    const brand = {
        logo: <span className="font-bold text-white">P</span>,
        name: "Platform",
        subtitle: "Admin Console",
    }

    // Static user for Platform (super-admin)
    const user = {
        name: "Admin",
        email: "Super Admin",
    }

    return (
        <AdminSidebar
            sections={sections}
            brand={brand}
            user={user}
            footerMenuItems={<LogoutButton variant="ghost" className="w-full text-red-500" />}
        />
    )
}
