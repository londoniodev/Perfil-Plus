"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE } from "@/lib/config";

export function BottomNav() {
    const pathname = usePathname();
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const isActive = (path: string) => pathname === path;

    const navItems = [
        { name: "Inicio", href: "/perfil", icon: <HomeIcon /> },
        { name: "Cursos", href: "/cursos", icon: <BookIcon /> },
        { name: "Ebooks", href: "/ebooks/mis-compras", icon: <LibraryIcon /> },
        { name: "Más", href: "#", icon: <MenuIcon />, action: () => setIsMenuOpen(!isMenuOpen) },
    ];

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
                        bottom: "60px", // Just above nav
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
                        <Link
                            href="/suscripcion"
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
                    paddingBottom: "safe-area-inset-bottom" // For iPhone home bar
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
