"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Use AuthContext for reliable auth state
    const { isAuthenticated, loading } = useAuth();

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    return (
        <header className="site-header">
            <div className="header-container">
                <Link href="/" className="header-logo-link">
                    {/* Desktop Logo */}
                    <img
                        src="/menu_logo.png"
                        alt="Mauro Mera"
                        className="header-logo logo-desktop"
                    />
                    {/* Mobile Icon */}
                    <img
                        src="/icon.ico"
                        alt="Mauro Mera"
                        className="header-logo logo-mobile"
                    />
                </Link>

                {/* Desktop Nav */}
                <nav className="nav-desktop">
                    <NavLinks isLoggedIn={isAuthenticated} />
                </nav>

                {/* Mobile Toggle */}
                <div className="header-mobile-toggle">
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
                {isMenuOpen && (
                    <div className="mobile-menu-dropdown">
                        <NavLinks isLoggedIn={isAuthenticated} onClick={() => setIsMenuOpen(false)} />
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
                className="nav-link"
            >
                Inicio
            </Link>
            <Link
                href="/portafolio"
                onClick={onClick}
                className="nav-link"
            >
                Portafolio
            </Link>
            <Link
                href="/formacion"
                onClick={onClick}
                className="nav-link"
            >
                Cursos
            </Link>
            <Link
                href="/blog"
                onClick={onClick}
                className="nav-link"
            >
                Blog
            </Link>
            <Link
                href="/ebooks"
                onClick={onClick}
                className="nav-link"
            >
                E-books
            </Link>
            <Link
                href="/servicios"
                onClick={onClick}
                className="nav-link"
                style={{ fontWeight: 500 }}
            >
                Servicios
            </Link>

            {isLoggedIn ? (
                /* Botón de Mi Panel si está logueado */
                <Link
                    href="/perfil"
                    onClick={onClick}
                    className="btn btn-primary"
                    style={{ padding: "0.5rem 1.2rem", fontSize: "0.9rem", fontFamily: "var(--font-serif)", fontWeight: 600 }}
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
                        style={{ padding: "0.5rem 1.2rem", fontSize: "0.9rem", fontFamily: "var(--font-serif)", fontWeight: 600 }}
                    >
                        Registrarse
                    </Link>
                    <Link
                        href="/login"
                        onClick={onClick}
                        className="btn btn-primary"
                        style={{ padding: "0.5rem 1.2rem", fontSize: "0.9rem", fontFamily: "var(--font-serif)", fontWeight: 600 }}
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
