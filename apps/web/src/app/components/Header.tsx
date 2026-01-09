"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export function Header() {
    const [isMobile, setIsMobile] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        const checkLogin = () => {
            const user = localStorage.getItem("user");
            setIsLoggedIn(!!user);
        };

        // Initial check
        handleResize();
        checkLogin();

        // Listen for storage events (login/logout in other tabs)
        window.addEventListener("storage", checkLogin);
        // Custom event for same-tab updates
        window.addEventListener("user-login", checkLogin);

        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("storage", checkLogin);
            window.removeEventListener("user-login", checkLogin);
        };
    }, []);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    return (
        <header
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                zIndex: 50,
                background: "rgba(15, 20, 25, 0.6)",
                backdropFilter: "blur(16px) saturate(180%)",
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
            }}
        >
            <div
                className="container"
                style={{
                    maxWidth: "1600px", // Más ancho para evitar que se amontone
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    height: "80px",
                    position: "relative"
                }}
            >
                <Link href="/">
                    {/* Desktop Logo */}
                    <img
                        src="/menu_logo.png"
                        alt="Mauro Mera"
                        style={{
                            height: "50px",
                            width: "auto",
                            objectFit: "contain",
                            display: isMobile ? "none" : "block"
                        }}
                    />
                    {/* Mobile Icon */}
                    <img
                        src="/icon.ico" // Browser often renders .ico in img tags fine, or we can use a converted png if needed. 
                        // If the user wants specific mobile icon, they mentioned icon.ico.
                        alt="Mauro Mera"
                        style={{
                            height: "40px",
                            width: "auto",
                            objectFit: "contain",
                            display: isMobile ? "block" : "none"
                        }}
                    />
                </Link>

                {/* Desktop Nav */}
                <nav
                    style={{
                        display: isMobile ? "none" : "flex",
                        alignItems: "center",
                        gap: "2.5rem"
                    }}
                >
                    <NavLinks isLoggedIn={isLoggedIn} />
                </nav>

                {/* Mobile Toggle */}
                <div style={{ display: isMobile ? "block" : "none" }}>
                    <button
                        onClick={toggleMenu}
                        style={{
                            background: "none",
                            border: "none",
                            color: "white",
                            cursor: "pointer",
                            padding: "0.5rem"
                        }}
                    >
                        {/* Simple Hamburger Icon */}
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            {isMenuOpen ? (
                                <>
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </>
                            ) : (
                                <>
                                    <line x1="3" y1="12" x2="21" y2="12" />
                                    <line x1="3" y1="6" x2="21" y2="6" />
                                    <line x1="3" y1="18" x2="21" y2="18" />
                                </>
                            )}
                        </svg>
                    </button>
                </div>

                {/* Mobile Dropdown Menu */}
                {isMobile && isMenuOpen && (
                    <div style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        background: "rgba(15, 20, 25, 0.95)",
                        backdropFilter: "blur(20px)",
                        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                        padding: "2rem",
                        display: "flex",
                        flexDirection: "column",
                        gap: "2rem",
                        alignItems: "center"
                    }}>
                        <NavLinks isLoggedIn={isLoggedIn} onClick={() => setIsMenuOpen(false)} />
                    </div>
                )}
            </div>
        </header>
    );
}

function NavLinks({ onClick, isLoggedIn }: { onClick?: () => void, isLoggedIn: boolean }) {
    return (
        <>
            <Link
                href="/"
                onClick={onClick}
                style={{
                    color: "var(--foreground-muted)",
                    textDecoration: "none",
                    fontSize: "0.95rem",
                    fontWeight: 500,
                    transition: "color 0.2s",
                }}
                className="hover:text-white"
            >
                Inicio
            </Link>
            <Link
                href="/portafolio"
                onClick={onClick}
                style={{
                    color: "var(--foreground-muted)",
                    textDecoration: "none",
                    fontSize: "0.95rem",
                    fontWeight: 500,
                }}
                className="hover:text-white"
            >
                Portafolio
            </Link>
            <Link
                href="/formacion"
                onClick={onClick}
                style={{
                    color: "var(--foreground-muted)",
                    textDecoration: "none",
                    fontSize: "0.95rem",
                    fontWeight: 500,
                }}
                className="hover:text-white"
            >
                Cursos
            </Link>
            <Link
                href="/blog"
                onClick={onClick}
                style={{
                    color: "var(--foreground-muted)",
                    textDecoration: "none",
                    fontSize: "0.95rem",
                    fontWeight: 500,
                }}
                className="hover:text-white"
            >
                Blog
            </Link>
            <Link
                href="/ebooks"
                onClick={onClick}
                style={{
                    color: "var(--foreground-muted)",
                    textDecoration: "none",
                    fontSize: "0.95rem",
                    fontWeight: 500,
                }}
                className="hover:text-white"
            >
                E-books
            </Link>
            <Link
                href="/servicios"
                onClick={onClick}
                style={{
                    color: "var(--foreground-muted)",
                    textDecoration: "none",
                    fontSize: "0.95rem",
                    fontWeight: 500,
                }}
                className="hover:text-white"
            >
                Servicios
            </Link>

            {isLoggedIn ? (
                /* Botón de Mi Panel si está logueado */
                <Link
                    href="/perfil"
                    onClick={onClick}
                    className="btn btn-primary"
                    style={{ padding: "0.7rem 1.4rem", fontSize: "0.9rem" }}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "0.5rem" }}>
                        <rect x="3" y="3" width="7" height="7" />
                        <rect x="14" y="3" width="7" height="7" />
                        <rect x="14" y="14" width="7" height="7" />
                        <rect x="3" y="14" width="7" height="7" />
                    </svg>
                    Mi Panel
                </Link>
            ) : (
                /* Botones de Login y Registro si NO está logueado */
                <>
                    <Link
                        href="/registro"
                        onClick={onClick}
                        className="btn btn-secondary"
                        style={{ padding: "0.7rem 1.4rem", fontSize: "0.9rem" }}
                    >
                        Registrarse
                    </Link>
                    <Link
                        href="/login"
                        onClick={onClick}
                        className="btn btn-primary"
                        style={{ padding: "0.7rem 1.4rem", fontSize: "0.9rem" }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "0.5rem" }}>
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                        Iniciar sesión
                    </Link>
                </>
            )}
        </>
    );
}
