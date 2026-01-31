/**
 * Sidebar Configuration
 * 
 * Defines the navigation structure based on tenant features.
 * Items are grouped by feature (core, shop, blog, lms) and rendered dynamically.
 */

import {
    LayoutDashboard,
    Settings,
    Users,
    Package,
    ClipboardList,
    FileText,
    GraduationCap,
    Palette,
    type LucideIcon,
} from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

export interface SidebarNavItem {
    title: string;
    href: string;
    icon?: LucideIcon;
}

export interface SidebarNavGroup {
    title: string;
    icon?: LucideIcon;
    items?: SidebarNavItem[];  // Sub-items (collapsible)
    href?: string;             // Direct link (no sub-items)
}

export interface SidebarFeatureSection {
    label: string;             // Section label (e.g., "Tienda")
    groups: SidebarNavGroup[];
}

export type FeatureKey = "shop" | "blog" | "lms";

export type SidebarConfig = {
    core: SidebarFeatureSection;
} & {
    [key in FeatureKey]?: SidebarFeatureSection;
};

// ============================================================================
// CONFIGURATION
// ============================================================================

export const sidebarConfig: SidebarConfig = {
    // ─────────────────────────────────────────────────────────────────────────
    // CORE: Always visible for admin users
    // ─────────────────────────────────────────────────────────────────────────
    core: {
        label: "Principal",
        groups: [
            {
                title: "Dashboard",
                href: "/admin",
                icon: LayoutDashboard,
            },
            {
                title: "Usuarios",
                href: "/admin/usuarios",
                icon: Users,
            },
            {
                title: "Configuración",
                icon: Settings,
                items: [
                    { title: "General", href: "/admin/settings" },
                    { title: "Branding", href: "/admin/settings/branding" },
                ],
            },
        ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // SHOP: E-commerce feature
    // ─────────────────────────────────────────────────────────────────────────
    shop: {
        label: "Tienda",
        groups: [
            {
                title: "Productos",
                icon: Package,
                items: [
                    { title: "Ver todos", href: "/admin/products" },
                    { title: "Crear nuevo", href: "/admin/products/new" },
                ],
            },
            {
                title: "Pedidos",
                href: "/admin/orders",
                icon: ClipboardList,
            },
        ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // BLOG: Blog/News feature
    // ─────────────────────────────────────────────────────────────────────────
    blog: {
        label: "Blog",
        groups: [
            {
                title: "Publicaciones",
                icon: FileText,
                items: [
                    { title: "Ver todas", href: "/admin/blog" },
                    { title: "Crear nueva", href: "/admin/blog/nuevo" },
                ],
            },
        ],
    },

    // ─────────────────────────────────────────────────────────────────────────
    // LMS: Learning Management System feature
    // ─────────────────────────────────────────────────────────────────────────
    lms: {
        label: "Academia",
        groups: [
            {
                title: "Cursos",
                icon: GraduationCap,
                items: [
                    { title: "Ver temas", href: "/admin/cursos" },
                    { title: "Crear tema", href: "/admin/cursos/temas/nuevo" },
                ],
            },
        ],
    },
};

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Get all sidebar sections based on active features
 */
export function getSidebarSections(features: FeatureKey[]): SidebarFeatureSection[] {
    const sections: SidebarFeatureSection[] = [sidebarConfig.core];

    features.forEach((feature) => {
        const section = sidebarConfig[feature];
        if (section) {
            sections.push(section);
        }
    });

    return sections;
}
