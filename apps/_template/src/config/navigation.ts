import {
    IconHome,
    IconBook,
    IconEdit,
    IconDocument,
    IconUsers,
    IconCreditCard,
    IconGrid,
    IconMessageCircle // Assuming we have this, or use fallback
} from "@alvarosky/ui";
import { FeatureKey } from "@alvarosky/types/config/features";

export interface NavItem {
    title: string;
    href: string;
    icon: any; // Lucide icon type
    allowedRoles: ('admin' | 'user')[];
    requiredFeature?: FeatureKey | 'all';
}

export const NAVIGATION_CONFIG: NavItem[] = [
    // === USER ===
    {
        title: "Mi Panel",
        href: "/perfil",
        icon: IconHome,
        allowedRoles: ['admin', 'user'],
        requiredFeature: 'all'
    },
    {
        title: "Mis Cursos",
        href: "/cursos",
        icon: IconBook,
        allowedRoles: ['user'],
        requiredFeature: 'lms'
    },
    {
        title: "Ebooks / Compras",
        href: "/ebooks/mis-compras",
        icon: IconGrid,
        allowedRoles: ['user'],
        requiredFeature: 'shop' // Assuming shop covers ebooks
    },
    {
        title: "Suscripción",
        href: "/suscripcion",
        icon: IconCreditCard,
        allowedRoles: ['user'],
        requiredFeature: 'all'
    },

    // === ADMIN ===
    {
        title: "Gestionar Cursos",
        href: "/admin/cursos",
        icon: IconEdit,
        allowedRoles: ['admin'],
        requiredFeature: 'lms'
    },
    {
        title: "Gestionar Blog",
        href: "/admin/blog",
        icon: IconDocument,
        allowedRoles: ['admin'],
        requiredFeature: 'blog'
    },
    {
        title: "Gestión de Productos",
        href: "/admin/productos",
        icon: IconGrid,
        allowedRoles: ['admin'],
        requiredFeature: 'shop'
    },
    {
        title: "Usuarios",
        href: "/admin/usuarios",
        icon: IconUsers,
        allowedRoles: ['admin'],
        requiredFeature: 'all'
    },

    // === PILOT FEATURE ===
    {
        title: "Bot WhatsApp",
        href: "/whatsapp",
        icon: IconMessageCircle, // Need to make sure this exists or use generic
        allowedRoles: ['admin'],
        requiredFeature: 'bot-whatsapp'
    }
];
