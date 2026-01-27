import {
    IconHome,
    IconBook,
    IconEdit,
    IconDocument,
    IconUsers,
    IconCreditCard,
    IconGrid
} from "@alvarosky/ui";

export type NavItem = {
    name: string;
    href: string;
    icon: any;
    feature?: string; // Feature required (e.g., 'lms', 'blog', 'shop')
    role?: 'ADMIN' | 'USER'; // Role required (if not specified, available to all or handled by filtered lists)
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
        { name: "Gestión de Productos", href: "/admin/productos", icon: IconGrid, feature: 'shop' },
        { name: "Usuarios", href: "/admin/usuarios", icon: IconUsers }, // Core admin feature
    ]
};
