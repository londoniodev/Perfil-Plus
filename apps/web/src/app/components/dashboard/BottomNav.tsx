"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export function BottomNav() {
    const pathname = usePathname();
    const router = useRouter();
    const { isAdmin, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const isActive = (path: string) => pathname?.startsWith(path);

    // Main nav items (max 4 for bottom nav)
    const navItems = [
        { name: "Inicio", href: "/perfil", icon: <HomeIcon /> },
        { name: "Cursos", href: "/cursos", icon: <BookIcon /> },
        { name: "Ebooks", href: "/ebooks/mis-compras", icon: <LibraryIcon /> },
        { name: "Más", href: "#", icon: <MenuIcon />, action: () => setIsMenuOpen(!isMenuOpen) },
    ];

    const handleLogout = async () => {
        await logout();
        router.push("/admin/login");
        setIsMenuOpen(false);
    };

    return (
        <>
            {/* Overlay Menu for "Más" */}
            {isMenuOpen && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: "60px",
                        background: "rgba(0,0,0,0.8)",
                        backdropFilter: "blur(5px)",
                        zIndex: 49,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-end",
                        padding: "1rem"
                    }}
                    onClick={() => setIsMenuOpen(false)}
                >
                    <div
                        style={{
                            background: "var(--background-secondary)",
                            borderRadius: "1rem",
                            padding: "1rem",
                            border: "1px solid var(--border)",
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.5rem"
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Subscription Link */}
                        <Link
                            href="/suscripcion"
                            onClick={() => setIsMenuOpen(false)}
                            style={{
                                padding: "1rem",
                                display: "flex",
                                alignItems: "center",
                                gap: "1rem",
                                textDecoration: "none",
                                color: "var(--foreground)",
                                borderBottom: "1px solid var(--border)"
                            }}
                        >
                            <CreditCardIcon /> Suscripción
                        </Link>

                        {/* Admin Links - Only for admins */}
                        {isAdmin && (
                            <>
                                <div style={{
                                    padding: "0.5rem 1rem",
                                    fontSize: "0.7rem",
                                    fontWeight: 600,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.05rem",
                                    color: "var(--accent)"
                                }}>
                                    Administración
                                </div>
                                <Link
                                    href="/admin/cursos"
                                    onClick={() => setIsMenuOpen(false)}
                                    style={{
                                        padding: "1rem",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "1rem",
                                        textDecoration: "none",
                                        color: "var(--foreground)",
                                    }}
                                >
                                    <EditIcon /> Gestionar Cursos
                                </Link>
                                <Link
                                    href="/admin/blog"
                                    onClick={() => setIsMenuOpen(false)}
                                    style={{
                                        padding: "1rem",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "1rem",
                                        textDecoration: "none",
                                        color: "var(--foreground)",
                                    }}
                                >
                                    <BlogIcon /> Gestionar Blog
                                </Link>
                                <Link
                                    href="/admin/usuarios"
                                    onClick={() => setIsMenuOpen(false)}
                                    style={{
                                        padding: "1rem",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "1rem",
                                        textDecoration: "none",
                                        color: "var(--foreground)",
                                        borderBottom: "1px solid var(--border)"
                                    }}
                                >
                                    <UsersIcon /> Usuarios
                                </Link>
                            </>
                        )}

                        {/* Logout Button */}
                        <button
                            onClick={handleLogout}
                            style={{
                                padding: "1rem",
                                display: "flex",
                                alignItems: "center",
                                gap: "1rem",
                                background: "none",
                                border: "none",
                                width: "100%",
                                color: "#ef4444",
                                cursor: "pointer",
                                fontSize: "1rem"
                            }}
                        >
                            <LogOutIcon /> Cerrar Sesión
                        </button>
                    </div>
                </div>
            )}

            {/* Bottom Navigation Bar */}
            <nav
                className="bottom-nav-mobile"
                style={{
                    position: "fixed",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: "60px",
                    background: "var(--background-secondary)",
                    borderTop: "1px solid var(--border)",
                    display: "flex",
                    justifyContent: "space-around",
                    alignItems: "center",
                    zIndex: 50,
                    paddingBottom: "safe-area-inset-bottom"
                }}
            >
                {navItems.map((item) => (
                    item.action ? (
                        <button
                            key={item.name}
                            onClick={item.action}
                            style={{
                                background: "none",
                                border: "none",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "4px",
                                color: isMenuOpen ? "var(--primary)" : "var(--foreground-muted)",
                                fontSize: "0.7rem",
                                cursor: "pointer",
                                width: "100%"
                            }}
                        >
                            {item.icon}
                            <span>{item.name}</span>
                        </button>
                    ) : (
                        <Link
                            key={item.href}
                            href={item.href}
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "4px",
                                textDecoration: "none",
                                color: isActive(item.href) ? "var(--primary)" : "var(--foreground-muted)",
                                fontSize: "0.7rem",
                                width: "100%"
                            }}
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

// Icons
function HomeIcon() {
    return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;
}
function BookIcon() {
    return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 1-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>;
}
function LibraryIcon() {
    return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>;
}
function MenuIcon() {
    return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>;
}
function CreditCardIcon() {
    return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>;
}
function LogOutIcon() {
    return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;
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
