"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
    IconHome,
    IconBook,
    IconGrid,
    IconMenu,
    IconEdit,
    IconDocument,
    IconUsers,
    IconCreditCard,
    IconLogout,
    IconClose
} from "@alvarosky/ui";
import { cn } from "@/lib/utils";

export function BottomNav() {
    const pathname = usePathname();
    const { isAdmin, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const isActive = (path: string) => pathname?.startsWith(path);

    const userNavItems = [
        { name: "Inicio", href: "/perfil", icon: <IconHome size={24} /> },
        { name: "Cursos", href: "/cursos", icon: <IconBook size={24} /> },
        { name: "Compras", href: "/compras", icon: <IconGrid size={24} /> },
        { name: "Más", href: "#", icon: <IconMenu size={24} />, action: () => setIsMenuOpen(!isMenuOpen) },
    ];

    const adminNavItems = [
        { name: "Inicio", href: "/perfil", icon: <IconHome size={24} /> },
        { name: "Cursos", href: "/admin/cursos", icon: <IconEdit size={24} /> },
        { name: "Blog", href: "/admin/blog", icon: <IconDocument size={24} /> },
        { name: "Más", href: "#", icon: <IconMenu size={24} />, action: () => setIsMenuOpen(!isMenuOpen) },
    ];

    const navItems = isAdmin ? adminNavItems : userNavItems;

    const handleLogout = async () => {
        await logout();
    };

    return (
        <>
            {/* Overlay Menu */}
            {isMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsMenuOpen(false)}
                >
                    <div
                        className="absolute bottom-16 left-4 right-4 bg-card border border-border rounded-xl shadow-xl overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between p-4 border-b border-border">
                            <span className="font-medium text-foreground">Más opciones</span>
                            <button onClick={() => setIsMenuOpen(false)} className="p-1 text-muted-foreground hover:text-foreground">
                                <IconClose size={20} />
                            </button>
                        </div>
                        <div className="p-2">
                            {isAdmin ? (
                                <Link
                                    href="/admin/usuarios"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground hover:bg-muted transition-colors"
                                >
                                    <IconUsers size={20} /> Usuarios
                                </Link>
                            ) : (
                                <Link
                                    href="/suscripcion"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground hover:bg-muted transition-colors"
                                >
                                    <IconCreditCard size={20} /> Suscripción
                                </Link>
                            )}
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                            >
                                <IconLogout size={20} /> Cerrar Sesión
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Navigation Bar */}
            <nav className="fixed bottom-0 left-0 right-0 border-t bg-background p-2 flex justify-around md:hidden z-50 safe-area-inset-bottom">
                {navItems.map((item) =>
                    item.action ? (
                        <button
                            key={item.name}
                            onClick={item.action}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 flex-1 py-2 text-xs font-medium transition-colors",
                                isMenuOpen
                                    ? "text-primary"
                                    : "text-muted-foreground"
                            )}
                        >
                            {item.icon}
                            <span>{item.name}</span>
                        </button>
                    ) : (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 flex-1 py-2 text-xs font-medium transition-colors",
                                isActive(item.href)
                                    ? "text-primary"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {item.icon}
                            <span>{item.name}</span>
                        </Link>
                    )
                )}
            </nav>
        </>
    );
}

