"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { API_BASE } from "@/lib/config";
import { useRouter } from "next/navigation";

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const menuItems = [
        { name: "Mi Panel", href: "/perfil", icon: <HomeIcon /> },
        { name: "Mis Cursos", href: "/cursos", icon: <BookIcon /> },
        { name: "Ebooks", href: "/ebooks/mis-compras", icon: <LibraryIcon /> },
        { name: "Suscripción", href: "/suscripcion", icon: <CreditCardIcon /> },
    ];

    const isActive = (path: string) => pathname === path;

    const handleLogout = async () => {
        try {
            await fetch(`${API_BASE}/auth/logout`, {
                method: "POST",
                credentials: 'include'
            });
        } catch (error) {
            console.error(error);
        }
        localStorage.removeItem("user");
        window.dispatchEvent(new Event("user-login"));
        router.push("/admin/login");
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
                    onClick={() => setIsCollapsed(!isCollapsed)}
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

            {/* Navigation */}
            <nav style={{ flex: 1, padding: "1.5rem 0.75rem" }}>
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
                                    color: isActive(item.href) ? "var(--primary)" : "var(--foreground-muted)",
                                    background: isActive(item.href) ? "rgba(99, 102, 241, 0.1)" : "transparent",
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

            {/* Toggle Button for Collapsed State (if hidden in header) */}
            {isCollapsed && (
                <button
                    onClick={() => setIsCollapsed(false)}
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
