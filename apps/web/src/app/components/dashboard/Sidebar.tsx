"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useDashboard } from "@/context/DashboardContext";
import { useAuth } from "@/context/AuthContext";

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { isCollapsed, toggleSidebar } = useDashboard();
    const { isAdmin, logout } = useAuth();

    // Menu items for regular users (consumers)
    const userMenuItems = [
        { name: "Mi Panel", href: "/perfil", icon: <HomeIcon /> },
        { name: "Mis Cursos", href: "/cursos", icon: <BookIcon /> },
        { name: "Ebooks", href: "/ebooks/mis-compras", icon: <LibraryIcon /> },
        { name: "Suscripción", href: "/suscripcion", icon: <CreditCardIcon /> },
    ];

    // Menu items for admins (managers) - completely replaces user menu
    const adminMenuItems = [
        { name: "Dashboard", href: "/perfil", icon: <HomeIcon /> },
        { name: "Gestionar Cursos", href: "/admin/cursos", icon: <EditIcon /> },
        { name: "Gestionar Blog", href: "/admin/blog", icon: <BlogIcon /> },
        { name: "Usuarios", href: "/admin/usuarios", icon: <UsersIcon /> },
    ];

    // Select menu based on role
    const menuItems = isAdmin ? adminMenuItems : userMenuItems;

    const isActive = (path: string) => pathname?.startsWith(path);

    const handleLogout = async () => {
        await logout();
        router.push("/login");
    };

    return (
        <aside
            className="sidebar-desktop"
            style={{
                width: isCollapsed ? "80px" : "280px",
                height: "100vh",
                position: "fixed",
                left: 0,
                top: 0,
                background: "var(--background-secondary)",
                borderRight: "1px solid var(--border)",
                transition: "width 0.3s ease",
                display: "flex",
                flexDirection: "column",
                zIndex: 40
            }}
        >
            {/* Logo Area */}
            <div style={{
                height: "80px",
                display: "flex",
                alignItems: "center",
                justifyContent: isCollapsed ? "center" : "space-between",
                padding: isCollapsed ? "0" : "0 1.5rem",
                borderBottom: "1px solid var(--border)"
            }}>
                {!isCollapsed && (
                    <img src="/menu_logo.png" alt="Logo" style={{ height: "30px", width: "auto" }} />
                )}
                {isCollapsed && (
                    <img src="/icon.ico" alt="Icon" style={{ height: "30px", width: "auto" }} />
                )}

                <button
                    onClick={toggleSidebar}
                    style={{
                        background: "none",
                        border: "none",
                        color: "var(--foreground-muted)",
                        cursor: "pointer",
                        display: isCollapsed ? "none" : "block"
                    }}
                >
                    <ChevronLeftIcon />
                </button>
            </div>

            {/* Role Badge (when not collapsed) */}
            {!isCollapsed && isAdmin && (
                <div style={{
                    padding: "0.75rem 1.5rem",
                    borderBottom: "1px solid var(--border)"
                }}>
                    <span style={{
                        background: "rgba(232, 168, 56, 0.15)",
                        color: "var(--accent)",
                        padding: "0.25rem 0.75rem",
                        borderRadius: "999px",
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.05rem"
                    }}>
                        Administrador
                    </span>
                </div>
            )}

            {/* Navigation */}
            <nav style={{ flex: 1, padding: "1.5rem 0.75rem", overflowY: "auto" }}>
                <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {menuItems.map((item) => (
                        <li key={item.href}>
                            <Link
                                href={item.href}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.75rem",
                                    padding: "0.75rem",
                                    borderRadius: "0.5rem",
                                    textDecoration: "none",
                                    color: isActive(item.href) ? (isAdmin ? "var(--accent)" : "var(--primary)") : "var(--foreground-muted)",
                                    background: isActive(item.href) ? (isAdmin ? "rgba(232, 168, 56, 0.1)" : "rgba(99, 102, 241, 0.1)") : "transparent",
                                    justifyContent: isCollapsed ? "center" : "flex-start",
                                    transition: "all 0.2s"
                                }}
                                title={isCollapsed ? item.name : ""}
                            >
                                <span style={{ display: "flex", alignItems: "center" }}>{item.icon}</span>
                                {!isCollapsed && <span style={{ fontWeight: 500 }}>{item.name}</span>}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Footer / Logout */}
            <div style={{ padding: "1.5rem", borderTop: "1px solid var(--border)" }}>
                <button
                    onClick={handleLogout}
                    style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        padding: "0.75rem",
                        background: "transparent",
                        border: "none",
                        color: "#ef4444",
                        cursor: "pointer",
                        justifyContent: isCollapsed ? "center" : "flex-start",
                        borderRadius: "0.5rem",
                        transition: "background 0.2s"
                    }}
                    title="Cerrar Sesión"
                >
                    <LogOutIcon />
                    {!isCollapsed && <span>Cerrar Sesión</span>}
                </button>
            </div>

            {/* Toggle Button for Collapsed State */}
            {isCollapsed && (
                <button
                    onClick={toggleSidebar}
                    style={{
                        position: "absolute",
                        top: "25px",
                        right: "-12px",
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        background: "var(--border)",
                        border: "none",
                        color: "var(--foreground)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        zIndex: 50
                    }}
                >
                    <ChevronRightIcon />
                </button>
            )}
        </aside>
    );
}

// Icons
function HomeIcon() {
    return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;
}
function BookIcon() {
    return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 1-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>;
}
function LibraryIcon() {
    return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>;
}
function CreditCardIcon() {
    return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>;
}
function LogOutIcon() {
    return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;
}
function ChevronLeftIcon() {
    return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>;
}
function ChevronRightIcon() {
    return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>;
}

// Admin Icons
function EditIcon() {
    return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
}
function BlogIcon() {
    return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;
}
function UsersIcon() {
    return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
}
