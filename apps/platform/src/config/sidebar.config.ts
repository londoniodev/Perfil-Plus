/**
 * Platform Sidebar Configuration
 * 
 * Defines the navigation structure for the Platform super-admin console.
 * Unlike tenant apps, Platform shows management of all tenants.
 */

import {
    Home,
    Users,
    Database,
    Settings,
    Plus,
} from "lucide-react";
import type { AdminSidebarSection, AdminSidebarNavGroup } from "@alvarosky/ui";

// ============================================================================
// TYPES
// ============================================================================

export interface TenantItem {
    name: string;
    slug: string;
}

// ============================================================================
// CONFIGURATION BUILDER
// ============================================================================

/**
 * Build sidebar sections for Platform super-admin
 * Includes dynamic tenant list
 */
export function getPlatformSections(tenants: TenantItem[] = []): AdminSidebarSection[] {
    // Build tenant sub-items dynamically
    const tenantSubItems = [
        { title: "Ver Todos", href: "/tenants" },
        ...tenants.map((tenant) => ({
            title: tenant.name || tenant.slug,
            href: `/tenants/${tenant.slug}`,
        })),
        { title: "Crear Tenant", href: "/tenants/new", icon: Plus },
    ];

    return [
        // Dashboard (standalone)
        {
            label: "Principal",
            groups: [
                {
                    title: "Dashboard",
                    href: "/",
                    icon: Home,
                },
            ],
        },
        // Application section with dynamic tenants
        {
            label: "Application",
            groups: [
                {
                    title: "Tenants",
                    icon: Users,
                    items: tenantSubItems,
                },
            ],
        },
        // System section
        {
            label: "System",
            groups: [
                {
                    title: "Bases de Datos",
                    href: "/databases",
                    icon: Database,
                },
                {
                    title: "Configuración",
                    href: "/settings",
                    icon: Settings,
                },
            ],
        },
    ];
}
