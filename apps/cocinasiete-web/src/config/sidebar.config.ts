/**
 * Sidebar Configuration
 * 
 * Defines the navigation structure based on tenant features and user roles.
 * Items are grouped by feature (core, shop, blog, lms, restaurant) and rendered dynamically.
 * Staff roles (WAITER, KITCHEN, CASHIER) get restricted sidebar sections.
 */

import {
    LayoutDashboard,
    Settings,
    Users,
    Package,
    ClipboardList,
    FileText,
    GraduationCap,
    UtensilsCrossed,
    ChefHat,
    QrCode,
    DollarSign,
    UserCog,
} from "lucide-react";
import type { AdminSidebarSection, AdminSidebarNavGroup, AdminSidebarNavItem } from "@alvarosky/ui";
import type { UserRole } from "@/types/auth";

// ============================================================================
// TYPES (Re-export for convenience)
// ============================================================================

export type SidebarNavItem = AdminSidebarNavItem;
export type SidebarNavGroup = AdminSidebarNavGroup;
export type SidebarFeatureSection = AdminSidebarSection;

export type FeatureKey = "shop" | "blog" | "lms" | "restaurant";

export type SidebarConfig = {
    core: AdminSidebarSection;
} & {
    [key in FeatureKey]?: AdminSidebarSection;
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
                href: "/admin/users",
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
    // ─────────────────────────────────────────────────────────────────────────
    // RESTAURANT: Gastronomy feature
    // ─────────────────────────────────────────────────────────────────────────
    restaurant: {
        label: "Restaurante",
        groups: [
            {
                title: "Empleados",
                href: "/admin/employees",
                icon: UserCog,
            },
            {
                title: "Menú",
                icon: UtensilsCrossed,
                items: [
                    { title: "Ver carta", href: "/admin/restaurant/menu" },
                    { title: "Nuevo plato", href: "/admin/restaurant/menu/new" },
                ],
            },
            {
                title: "Comandas",
                href: "/admin/restaurant/orders",
                icon: ChefHat,
            },
            {
                title: "Caja",
                href: "/admin/restaurant/cashier",
                icon: DollarSign,
            },
            {
                title: "Punto de Venta (POS)",
                href: "/admin/restaurant/pos",
                icon: ClipboardList,
            },
            {
                title: "Cocina (KDS Exclusivo)",
                href: "/kitchen",
                icon: ChefHat,
            },
            {
                title: "Mesero (Pedidos)",
                icon: ClipboardList,
                items: [
                    { title: "Activas", href: "/waiter?tab=active" },
                    { title: "Pendientes", href: "/waiter?tab=pending" },
                    { title: "En Cocina", href: "/waiter?tab=kitchen" },
                    { title: "Listas", href: "/waiter?tab=ready" },
                    { title: "Historial", href: "/waiter?tab=history" },
                ]
            },
            {
                title: "Mesas",
                href: "/admin/restaurant/tables",
                icon: QrCode,
            },
        ],
    },
};

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Get all sidebar sections based on active features (ADMIN role)
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

/**
 * Get sidebar sections for staff roles (WAITER, KITCHEN, CASHIER)
 * Each role only sees the sections relevant to their responsibilities.
 */
export function getStaffSections(role: UserRole, features: FeatureKey[]): SidebarFeatureSection[] {
    // Staff only sees restaurant-related sections when the feature is enabled
    if (!features.includes('restaurant')) {
        return [{
            label: "Sin Acceso",
            groups: [
                { title: "Sin funciones asignadas", href: "/", icon: LayoutDashboard },
            ],
        }];
    }

    switch (role) {
        case 'WAITER':
            return [{
                label: "Mesero",
                groups: [
                    {
                        title: "Pedidos",
                        icon: ClipboardList,
                        items: [
                            { title: "Activas", href: "/waiter?tab=active" },
                            { title: "Pendientes", href: "/waiter?tab=pending" },
                            { title: "En Cocina", href: "/waiter?tab=kitchen" },
                            { title: "Listas", href: "/waiter?tab=ready" },
                            { title: "Historial", href: "/waiter?tab=history" },
                        ],
                    },
                ],
            }];

        case 'KITCHEN':
            return [{
                label: "Cocina",
                groups: [
                    {
                        title: "Comandas",
                        href: "/admin/restaurant/orders",
                        icon: ChefHat,
                    },
                ],
            }];

        case 'CASHIER':
            return [{
                label: "Caja",
                groups: [
                    {
                        title: "Caja",
                        href: "/admin/restaurant/cashier",
                        icon: DollarSign,
                    },
                    {
                        title: "Punto de Venta (POS)",
                        href: "/admin/restaurant/pos",
                        icon: ClipboardList,
                    },
                    {
                        title: "Mesas",
                        href: "/admin/restaurant/tables",
                        icon: QrCode,
                    },
                    {
                        title: "Menú",
                        icon: UtensilsCrossed,
                        items: [
                            { title: "Ver carta", href: "/admin/restaurant/menu" },
                            { title: "Nuevo plato", href: "/admin/restaurant/menu/new" },
                        ],
                    },
                ],
            }];

        default:
            return [];
    }
}

/**
 * Get user (non-admin) sidebar sections
 * Shows user-facing navigation based on enabled features
 */
export function getUserSections(features: FeatureKey[]): SidebarFeatureSection[] {
    const userItems: AdminSidebarNavGroup[] = [
        { title: "Mi Panel", href: "/perfil", icon: LayoutDashboard },
    ];

    // Add feature-specific user items
    if (features.includes("lms")) {
        userItems.push({ title: "Mis Cursos", href: "/cursos", icon: GraduationCap });
    }
    if (features.includes("shop")) {
        userItems.push({ title: "Mis Compras", href: "/compras", icon: Package });
    }

    return [{
        label: "Mi Panel",
        groups: userItems,
    }];
}
