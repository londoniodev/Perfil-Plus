"use client"

import { useAuth } from "@/context/AuthContext"
import { AdminSidebar, type AdminSidebarSection } from "@alvarosky/ui"
import { getSidebarSections, getUserSections, type FeatureKey } from "@/config/sidebar.config"

// ============================================================================
// TYPES
// ============================================================================

interface DashboardSidebarProps {
    features: FeatureKey[];
    tenantName: string;
}

// ============================================================================
// CLIENT WRAPPER
// Thin wrapper that provides auth context to AdminSidebar
// ============================================================================

export function DashboardSidebar({ features, tenantName }: DashboardSidebarProps) {
    const { logout, isAdmin, user } = useAuth()

    // Get navigation sections based on role
    const sections: AdminSidebarSection[] = isAdmin
        ? getSidebarSections(features)
        : getUserSections(features)

    // Brand configuration
    const brand = {
        logo: (
            <img
                src="/images/branding/menu_logo.png"
                alt="Logo"
                className="size-5 object-contain brightness-0 invert"
            />
        ),
        name: tenantName,
        subtitle: isAdmin ? "Consola Admin" : "Plataforma",
    }

    // User configuration
    const userConfig = user ? {
        name: user.name || "Usuario",
        email: user.email,
        avatar: user.avatar ?? undefined,
    } : undefined

    return (
        <AdminSidebar
            sections={sections}
            brand={brand}
            user={userConfig}
            onLogout={logout}
        />
    )
}
