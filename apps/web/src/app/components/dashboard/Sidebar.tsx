"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDashboard } from "@/context/DashboardContext";
import { useAuth } from "@/context/AuthContext";
import {
    IconHome,
    IconBook,
    IconCreditCard,
    IconEdit,
    IconDocument, // Was IconFileText
    IconUsers,
    IconLogout, // Was IconLogOut
    IconChevronLeft,
    IconChevronRight,
    IconGrid
} from "@/app/components/ui/Icons";
import styles from "@/app/styles/dashboard.module.css";

export function Sidebar() {
    const pathname = usePathname();
    const { isCollapsed, toggleSidebar } = useDashboard();
    const { isAdmin, logout } = useAuth();

    // Menu items for regular users (consumers)
    const userMenuItems = [
        { name: "Mi Panel", href: "/perfil", icon: <IconHome size={20} /> },
        { name: "Mis Cursos", href: "/cursos", icon: <IconBook size={20} /> },
        { name: "Ebooks", href: "/ebooks/mis-compras", icon: <IconGrid size={20} /> },
        { name: "Suscripción", href: "/suscripcion", icon: <IconCreditCard size={20} /> },
    ];

    // Menu items for admins (managers)
    const adminMenuItems = [
        { name: "Dashboard", href: "/perfil", icon: <IconHome size={20} /> },
        { name: "Gestionar Cursos", href: "/admin/cursos", icon: <IconEdit size={20} /> },
        { name: "Gestionar Blog", href: "/admin/blog", icon: <IconDocument size={20} /> },
        { name: "Gestionar E-books", href: "/admin/ebooks", icon: <IconBook size={20} /> },
        { name: "Usuarios", href: "/admin/usuarios", icon: <IconUsers size={20} /> },
    ];

    // Select menu based on role
    const menuItems = isAdmin ? adminMenuItems : userMenuItems;

    const isActive = (path: string) => pathname?.startsWith(path);

    const handleLogout = async () => {
        await logout();
    };

    return (
        <aside
            className={`${styles.sidebarDesktop} ${isCollapsed ? styles.sidebarCollapsed : ""}`}
        >
            {/* Logo Area */}
            <div className={`${styles.logoArea} ${isCollapsed ? styles.logoAreaCollapsed : ""}`}>
                {!isCollapsed && (
                    <img src="/menu_logo.png" alt="Logo" style={{ height: "30px", width: "auto" }} />
                )}
                {isCollapsed && (
                    <img src="/icon.ico" alt="Icon" style={{ height: "30px", width: "auto" }} />
                )}

                <button
                    onClick={toggleSidebar}
                    className={styles.toggleBtn}
                    style={{ display: isCollapsed ? "none" : "block" }}
                >
                    <IconChevronLeft size={20} />
                </button>
            </div>

            {/* Role Badge (when not collapsed) */}
            {!isCollapsed && isAdmin && (
                <div className={styles.adminBadge}>
                    <span className={styles.badgePill}>
                        Administrador
                    </span>
                </div>
            )}

            {/* Navigation */}
            <nav className={styles.navContainer}>
                <ul className={styles.navList}>
                    {menuItems.map((item) => {
                        const active = isActive(item.href);
                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={`
                                        ${styles.navLink} 
                                        ${isCollapsed ? styles.navLinkCollapsed : ""}
                                        ${active ? (isAdmin ? styles.navLinkActiveAdmin : styles.navLinkActive) : ""}
                                    `}
                                    title={isCollapsed ? item.name : ""}
                                >
                                    <span className={styles.navIcon}>{item.icon}</span>
                                    {!isCollapsed && <span style={{ fontWeight: 500 }}>{item.name}</span>}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Footer / Logout */}
            <div className={styles.footerArea}>
                <button
                    onClick={handleLogout}
                    className={`${styles.logoutBtn} ${isCollapsed ? styles.logoutBtnCollapsed : ""}`}
                    title="Cerrar Sesión"
                >
                    <IconLogout size={20} />
                    {!isCollapsed && <span>Cerrar Sesión</span>}
                </button>
            </div>

            {/* Toggle Button for Collapsed State */}
            {isCollapsed && (
                <button
                    onClick={toggleSidebar}
                    className={styles.toggleBtnCollapsed}
                >
                    <IconChevronRight size={20} />
                </button>
            )}
        </aside>
    );
}
