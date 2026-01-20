"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDashboard } from "@/context/DashboardContext";
import { useAuth } from "@/hooks";
import {
    IconHome,
    IconBook,
    IconCreditCard,
    IconEdit,
    IconDocument,
    IconUsers,
    IconLogout,
    IconChevronLeft,
    IconChevronRight,
    IconGrid
} from "@alvarosky/ui";
import { cn } from "@/lib/utils";

export function Sidebar() {
    const pathname = usePathname();
    const { isCollapsed, toggleSidebar } = useDashboard();
    const { isAdmin, logout } = useAuth();

    const userMenuItems = [
        { name: "Mi Panel", href: "/perfil", icon: <IconHome size={20} /> },
        { name: "Mis Cursos", href: "/cursos", icon: <IconBook size={20} /> },
        { name: "Ebooks", href: "/ebooks/mis-compras", icon: <IconGrid size={20} /> },
        { name: "Suscripción", href: "/suscripcion", icon: <IconCreditCard size={20} /> },
    ];

    const adminMenuItems = [
        { name: "Dashboard", href: "/perfil", icon: <IconHome size={20} /> },
        { name: "Gestionar Cursos", href: "/admin/cursos", icon: <IconEdit size={20} /> },
        { name: "Gestionar Blog", href: "/admin/blog", icon: <IconDocument size={20} /> },
        { name: "Gestionar E-books", href: "/admin/ebooks", icon: <IconBook size={20} /> },
        { name: "Usuarios", href: "/admin/usuarios", icon: <IconUsers size={20} /> },
    ];

    const menuItems = isAdmin ? adminMenuItems : userMenuItems;
    const isActive = (path: string) => pathname?.startsWith(path);

    const handleLogout = async () => {
        await logout();
    };

    return (
        <aside
            className={cn(
                "fixed left-0 top-0 h-screen border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-40 transition-all duration-300 hidden md:flex flex-col",
                isCollapsed ? "w-16" : "w-64"
            )}
        >
            {/* Logo Area */}
            <div className={cn(
                "flex items-center h-16 border-b px-4",
                isCollapsed ? "justify-center" : "justify-between"
            )}>
                {!isCollapsed && (
                    <img src="/images/branding/menu_logo.png" alt="Logo" className="h-7 w-auto" />
                )}
                {isCollapsed && (
                    <img src="/icon.ico" alt="Icon" className="h-7 w-auto" />
                )}
                {!isCollapsed && (
                    <button
                        onClick={toggleSidebar}
                        className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <IconChevronLeft size={18} />
                    </button>
                )}
            </div>

            {/* Role Badge */}
            {!isCollapsed && isAdmin && (
                <div className="px-4 py-3">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                        Administrador
                    </span>
                </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-4 px-3">
                <ul className="space-y-1">
                    {menuItems.map((item) => {
                        const active = isActive(item.href);
                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                        isCollapsed && "justify-center px-0",
                                        active
                                            ? isAdmin
                                                ? "bg-primary/10 text-primary"
                                                : "bg-primary/10 text-primary"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                    )}
                                    title={isCollapsed ? item.name : ""}
                                >
                                    <span className="shrink-0">{item.icon}</span>
                                    {!isCollapsed && <span>{item.name}</span>}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Footer / Logout */}
            <div className="p-3 border-t">
                <button
                    onClick={handleLogout}
                    className={cn(
                        "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors",
                        isCollapsed && "justify-center px-0"
                    )}
                    title="Cerrar Sesión"
                >
                    <IconLogout size={20} />
                    {!isCollapsed && <span>Cerrar Sesión</span>}
                </button>
            </div>

            {/* Toggle Button for Collapsed */}
            {isCollapsed && (
                <button
                    onClick={toggleSidebar}
                    className="absolute -right-3 top-20 p-1.5 rounded-full bg-background border shadow-sm hover:bg-muted transition-colors"
                >
                    <IconChevronRight size={14} />
                </button>
            )}
        </aside>
    );
}

