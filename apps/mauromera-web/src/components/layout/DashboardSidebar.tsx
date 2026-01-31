"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    IconHome,
    IconBook,
    IconEdit,
    IconDocument,
    IconUsers,
    IconLogout,
    IconCreditCard,
    IconGrid
} from "@alvarosky/ui";
import { useAuth } from "@/context/AuthContext";
import { useDashboard } from "@/context/DashboardContext"; // Assuming we might deprecate this context later or adapt it
import { cn } from "@/lib/utils";
import { Button } from "@alvarosky/ui";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

export function DashboardSidebar({ className }: SidebarProps) {
    const pathname = usePathname();
    const { logout, isAdmin } = useAuth();

    const userMenuItems = [
        { name: "Mi Panel", href: "/perfil", icon: IconHome },
        { name: "Mis Cursos", href: "/cursos", icon: IconBook },
        { name: "Mis Compras", href: "/compras", icon: IconGrid },
        { name: "Suscripción", href: "/suscripcion", icon: IconCreditCard },
    ];

    const adminMenuItems = [
        { name: "Dashboard", href: "/admin", icon: IconHome },
        { name: "Gestionar Cursos", href: "/admin/cursos", icon: IconEdit },
        { name: "Gestionar Blog", href: "/admin/blog", icon: IconDocument },
        { name: "Gestión de Productos", href: "/admin/productos", icon: IconGrid },
        { name: "Usuarios", href: "/admin/usuarios", icon: IconUsers },
    ];

    const menuItems = isAdmin ? adminMenuItems : userMenuItems;

    return (
        <div className={cn("pb-12 h-full", className)}>
            <div className="space-y-4 py-4 h-full flex flex-col">
                <div className="px-3 py-2">
                    <div className="mb-2 px-4 flex items-center gap-2">
                        <img src="/images/branding/menu_logo.png" alt="Logo" className="h-8 w-auto" />
                    </div>
                    {isAdmin && (
                        <div className="px-4 mb-4">
                            <span className="bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5 rounded-full">
                                Administrador
                            </span>
                        </div>
                    )}
                    <div className="space-y-1">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname?.startsWith(item.href);
                            return (
                                <Button
                                    key={item.href}
                                    variant={isActive ? "secondary" : "ghost"}
                                    size="sm"
                                    className={cn(
                                        "w-full justify-start",
                                        isActive && "bg-secondary font-medium"
                                    )}
                                    asChild
                                >
                                    <Link href={item.href}>
                                        <Icon className="mr-2 h-4 w-4" />
                                        {item.name}
                                    </Link>
                                </Button>
                            );
                        })}
                    </div>
                </div>
                <div className="mt-auto px-3 py-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => logout()}
                    >
                        <IconLogout className="mr-2 h-4 w-4" />
                        Cerrar Sesión
                    </Button>
                </div>
            </div>
        </div>
    );
}

