"use client"

import { useAuth } from "@/context/AuthContext"
import Image from "next/image"
import { AdminSidebar, type AdminSidebarSection } from "@alvarosky/ui"
import { getSidebarSections, getStaffSections, getUserSections, type FeatureKey } from "@/config/sidebar.config"
import { STAFF_ROLES } from "@/types/auth"
import { TENANT_ID } from "@/lib/config"

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
    const { logout, isAdmin, isStaff, user } = useAuth()

    // Get navigation sections based on role
    let sections: AdminSidebarSection[];

    if (isAdmin) {
        sections = getSidebarSections(features);
    } else if (isStaff && user?.role) {
        sections = getStaffSections(user.role, features);
    } else {
        sections = getUserSections(features);
    }

    // Dynamic Injection: Menu Digital Link (only for admin)
    if (isAdmin && features.includes('restaurant')) {
        const restaurantSection = sections.find(s => s.label === 'Restaurante')
        if (restaurantSection) {
            // Add to the "Menú" group
            const menuGroup = restaurantSection.groups.find(g => g.title === 'Menú');
            if (menuGroup && menuGroup.items) {
                const alreadyExists = menuGroup.items.some(item => item.title === "Ver Menú Digital ↗");
                if (!alreadyExists) {
                    // Use the tenant's public domain so it opens the storefront, not the dashboard
                    const publicOrigin = typeof window !== 'undefined' ? window.location.origin : ''
                    menuGroup.items.push({
                        title: "Ver Menú Digital ↗",
                        href: `${publicOrigin}/menu`,
                        external: true,
                    } as any);
                }
            }
        }
    }

    // Determine subtitle based on role
    let subtitle = "Plataforma";
    if (isAdmin) subtitle = "Consola Admin";
    else if (user?.role === "WAITER") subtitle = "Mesero";
    else if (user?.role === "KITCHEN") subtitle = "Cocina";
    else if (user?.role === "CASHIER") subtitle = "Caja";

    // Brand configuration
    const brand = {
        logo: (
            <Image
                src="/images/branding/menu_logo.png"
                alt="Logo"
                width={20}
                height={20}
                className="object-contain brightness-0 invert"
                unoptimized
            />
        ),
        name: tenantName,
        subtitle,
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
