import {
    IconHome,
    IconBook,
    IconEdit,
    IconDocument,
    IconUsers,
    IconCreditCard,
    IconGrid
} from "@alvarosky/ui";
import type { AdminSidebarSection } from "@alvarosky/ui";

export type NavItem = {
    name: string;
    href: string;
    icon: any;
    feature?: string; // Feature required (e.g., 'lms', 'blog', 'shop')
    role?: 'ADMIN' | 'USER'; // Role required (if not specified, available to all or handled by filtered lists)
    items?: NavItem[]; // Nested items support
};

export const NAVIGATION_CONFIG: {
    user: NavItem[];
    admin: NavItem[];
} = {
    user: [
        { name: "Mi Panel", href: "/perfil", icon: IconHome },
        { name: "Mis Cursos", href: "/cursos", icon: IconBook, feature: 'lms' },
        { name: "Mis Compras", href: "/compras", icon: IconGrid, feature: 'shop' },
        { name: "Suscripción", href: "/suscripcion", icon: IconCreditCard }, // Core feature? Or 'subscription'?
    ],
    admin: [
        { name: "Dashboard", href: "/perfil", icon: IconHome },
        { name: "Gestionar Cursos", href: "/admin/cursos", icon: IconEdit, feature: 'lms' },
        { name: "Gestionar Blog", href: "/admin/blog", icon: IconDocument, feature: 'blog' },
        { name: "Gestión de Productos", href: "/admin/products", icon: IconGrid, feature: 'shop' },
        { name: "Usuarios", href: "/admin/usuarios", icon: IconUsers }, // Core admin feature
    ]
};

// ============================================================================
// USER SECTIONS HELPER
// Converts user navigation items to AdminSidebarSection[] format
// ============================================================================

type FeatureKey = "shop" | "blog" | "lms";

export function getUserSections(features: FeatureKey[]): AdminSidebarSection[] {
    // Filter user items based on enabled features
    const filteredItems = NAVIGATION_CONFIG.user.filter((item) => {
        if (item.feature && !features.includes(item.feature as FeatureKey)) {
            return false;
        }
        return true;
    });

    // Convert to AdminSidebarSection format
    return [{
        label: "Mi Panel",
        groups: filteredItems.map((item) => ({
            title: item.name,
            href: item.href,
            icon: item.icon,
        })),
    }];
}

