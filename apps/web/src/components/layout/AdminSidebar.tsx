"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    IconHome,
    IconBook,
    IconEdit,
    IconDocument,
    IconUsers,
    IconLogout
} from "@mauromera/ui";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@mauromera/ui";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

export function AdminSidebar({ className }: SidebarProps) {
    const pathname = usePathname();
    const { logout } = useAuth();

    const adminMenuItems = [
        { name: "Dashboard", href: "/perfil", icon: IconHome },
        { name: "Gestionar Cursos", href: "/admin/cursos", icon: IconEdit },
        { name: "Gestionar Blog", href: "/admin/blog", icon: IconDocument },
        { name: "Gestionar E-books", href: "/admin/ebooks", icon: IconBook },
        { name: "Usuarios", href: "/admin/usuarios", icon: IconUsers },
    ];

    return (
        <div className={cn("pb-12", className)}>
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <div className="mb-2 px-4 flex items-center gap-2">
                        <img src="/icon.ico" alt="Logo" className="h-6 w-6" />
                        <h2 className="text-lg font-semibold tracking-tight">
                            Admin Panel
                        </h2>
                    </div>
                    <div className="space-y-1">
                        {adminMenuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname?.startsWith(item.href);
                            return (
                                <Button
                                    key={item.href}
                                    variant={isActive ? "secondary" : "ghost"}
                                    size="sm"
                                    className="w-full justify-start"
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
                <div className="px-3 py-2">
                    <div className="space-y-1">
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
        </div>
    );
}
