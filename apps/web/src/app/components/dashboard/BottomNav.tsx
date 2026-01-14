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
    IconDocument as IconFileText, // Aliased for local compatibility
    IconUsers,
    IconCreditCard,
    IconLogout as IconLogOut // Aliased for local compatibility
} from "@/app/components/ui/Icons";
import styles from "@/app/styles/dashboard.module.css";

export function BottomNav() {
    const pathname = usePathname();
    const { isAdmin, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const isActive = (path: string) => pathname?.startsWith(path);

    // User navigation items
    const userNavItems = [
        { name: "Inicio", href: "/perfil", icon: <IconHome size={24} /> },
        { name: "Cursos", href: "/cursos", icon: <IconBook size={24} /> },
        { name: "Ebooks", href: "/ebooks/mis-compras", icon: <IconGrid size={24} /> },
        { name: "Más", href: "#", icon: <IconMenu size={24} />, action: () => setIsMenuOpen(!isMenuOpen) },
    ];

    // Admin navigation items
    const adminNavItems = [
        { name: "Inicio", href: "/perfil", icon: <IconHome size={24} /> },
        { name: "Cursos", href: "/admin/cursos", icon: <IconEdit size={24} /> },
        { name: "Blog", href: "/admin/blog", icon: <IconFileText size={24} /> },
        { name: "Más", href: "#", icon: <IconMenu size={24} />, action: () => setIsMenuOpen(!isMenuOpen) },
    ];

    // Select nav based on role
    const navItems = isAdmin ? adminNavItems : userNavItems;

    const handleLogout = async () => {
        await logout();
    };

    return (
        <>
            {/* Overlay Menu for "Más" */}
            {isMenuOpen && (
                <div
                    className={styles.mobileMenuOverlay}
                    onClick={() => setIsMenuOpen(false)}
                >
                    <div
                        className={styles.mobileMenuContent}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Role-specific additional items */}
                        {isAdmin ? (
                            // Admin extra item
                            <Link
                                href="/admin/usuarios"
                                onClick={() => setIsMenuOpen(false)}
                                className={styles.mobileMenuItem}
                            >
                                <IconUsers size={20} /> Usuarios
                            </Link>
                        ) : (
                            // User extra item
                            <Link
                                href="/suscripcion"
                                onClick={() => setIsMenuOpen(false)}
                                className={styles.mobileMenuItem}
                            >
                                <IconCreditCard size={20} /> Suscripción
                            </Link>
                        )}

                        {/* Logout Button */}
                        <button
                            onClick={handleLogout}
                            className={styles.mobileMenuItem}
                            style={{ border: "none", color: "var(--error)", padding: "1rem" }}
                        >
                            <IconLogOut size={20} /> Cerrar Sesión
                        </button>
                    </div>
                </div>
            )}

            {/* Bottom Navigation Bar */}
            <nav className={styles.bottomNav}>
                {navItems.map((item) => (
                    item.action ? (
                        <button
                            key={item.name}
                            onClick={item.action}
                            className={`
                                ${styles.navItemMobile}
                                ${isMenuOpen ? (isAdmin ? styles.navItemMobileActiveAdmin : styles.navItemMobileActive) : ""}
                            `}
                        >
                            {item.icon}
                            <span>{item.name}</span>
                        </button>
                    ) : (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`
                                ${styles.navItemMobile}
                                ${isActive(item.href) ? (isAdmin ? styles.navItemMobileActiveAdmin : styles.navItemMobileActive) : ""}
                            `}
                        >
                            {item.icon}
                            <span>{item.name}</span>
                        </Link>
                    )
                ))}
            </nav>
        </>
    );
}
