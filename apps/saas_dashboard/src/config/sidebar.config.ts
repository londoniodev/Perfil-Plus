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
    Warehouse,
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
                href: "/",
                icon: LayoutDashboard,
            },
            {
                title: "Usuarios",
                href: "/usuarios",
                icon: Users,
            },
            {
                title: "CRM",
                icon: Users,
                items: [
                    { title: "Clientes (Leads)", href: "/clientes" },
                ],
            },

            {
                title: "Configuración",
                icon: Settings,
                items: [
                    { title: "Perfil", href: "/perfil" }, // Mantenemos la estructura consistente del dashboard
                    { title: "Negocio", href: "/configuracion" },
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
                    { title: "Ver todos", href: "/tienda/productos" },
                    { title: "Crear nuevo", href: "/tienda/productos/nuevo" },
                ],
            },
            {
                title: "Pedidos",
                href: "/tienda/pedidos",
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
                    { title: "Ver todas", href: "/blog/publicaciones" },
                    { title: "Crear nueva", href: "/blog/publicaciones/nuevo" },
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
                    { title: "Ver temas", href: "/academia/cursos" },
                    { title: "Crear tema", href: "/academia/cursos/temas/nuevo" },
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
                href: "/restaurante/empleados",
                icon: UserCog,
            },
            {
                title: "Menú",
                icon: UtensilsCrossed,
                items: [
                    { title: "Ver carta", href: "/restaurante/menu" },
                    { title: "Nuevo plato", href: "/restaurante/menu/nuevo" },
                ],
            },
            {
                title: "Comandas",
                href: "/restaurante/comandas",
                icon: ChefHat,
            },
            {
                title: "Caja",
                href: "/restaurante/caja",
                icon: DollarSign,
            },
            {
                title: "Punto de Venta (POS)",
                href: "/restaurante/pos",
                icon: ClipboardList,
            },
            {
                title: "Cocina (KDS Exclusivo)",
                href: "/restaurante/cocina",
                icon: ChefHat,
            },
            {
                title: "Mesero (Pedidos)",
                icon: ClipboardList,
                items: [
                    { title: "Activas", href: "/restaurante/mesero?tab=active" },
                    { title: "Pendientes", href: "/restaurante/mesero?tab=pending" },
                    { title: "En Cocina", href: "/restaurante/mesero?tab=kitchen" },
                    { title: "Listas", href: "/restaurante/mesero?tab=ready" },
                    { title: "Historial", href: "/restaurante/mesero?tab=history" },
                ]
            },
            {
                title: "Mesas",
                href: "/restaurante/mesas",
                icon: QrCode,
            },
            {
                title: "Inventarios",
                icon: Warehouse,
                items: [
                    { title: "Ingredientes", href: "/restaurante/inventario" },
                    { title: "Nuevo ingrediente", href: "/restaurante/inventario/nuevo" },
                    { title: "Almacenes", href: "/restaurante/inventario/almacenes" },
                    { title: "Recetas", href: "/restaurante/recetas" },
                    { title: "Conteo físico", href: "/restaurante/inventario/conteos" },
                    { title: "Costeo y Márgenes", href: "/restaurante/costeo" },
                ],
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
                            { title: "Activas", href: "/restaurante/mesero?tab=active" },
                            { title: "Pendientes", href: "/restaurante/mesero?tab=pending" },
                            { title: "En Cocina", href: "/restaurante/mesero?tab=kitchen" },
                            { title: "Listas", href: "/restaurante/mesero?tab=ready" },
                            { title: "Historial", href: "/restaurante/mesero?tab=history" },
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
                        href: "/restaurante/comandas",
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
                        href: "/restaurante/caja",
                        icon: DollarSign,
                    },
                    {
                        title: "Punto de Venta (POS)",
                        href: "/restaurante/pos",
                        icon: ClipboardList,
                    },
                    {
                        title: "Mesas",
                        href: "/restaurante/mesas",
                        icon: QrCode,
                    },
                    {
                        title: "Menú",
                        icon: UtensilsCrossed,
                        items: [
                            { title: "Ver carta", href: "/restaurante/menu" },
                            { title: "Nuevo plato", href: "/restaurante/menu/nuevo" },
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
        userItems.push({ title: "Mis Cursos", href: "/academia/cursos", icon: GraduationCap });
    }
    if (features.includes("shop")) {
        userItems.push({ title: "Mis Compras", href: "/compras", icon: Package });
    }

    return [{
        label: "Mi Panel",
        groups: userItems,
    }];
}
