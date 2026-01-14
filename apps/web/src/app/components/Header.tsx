"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();

    const { isAuthenticated, loading } = useAuth();

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => setIsMenuOpen(false);

    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMenuOpen]);

    return (
        <header className="site-header">
            <div className="header-container">
                {/* Mobile: Hamburger LEFT */}
                <div className="header-mobile-toggle">
                    <button
                        onClick={toggleMenu}
                        className="hamburger-btn"
                        aria-label="Toggle menu"
                    >
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="3" y1="12" x2="21" y2="12" />
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <line x1="3" y1="18" x2="21" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Logo - RIGHT on mobile, LEFT on desktop */}
                <Link href="/" className="header-logo-link" onClick={closeMenu}>
                    <img
                        src="/menu_logo.png"
                        alt="Mauro Mera"
                        className="header-logo logo-desktop"
                    />
                    <img
                        src="/icon.ico"
                        alt="Mauro Mera"
                        className="header-logo logo-mobile"
                    />
                </Link>

                {/* Desktop Nav */}
                <nav className="nav-desktop">
                    <DesktopNavLinks isLoggedIn={isAuthenticated} currentPath={pathname} />
                </nav>

                {/* Mobile Side Drawer - From LEFT */}
                <div className={`mobile-menu-overlay ${isMenuOpen ? 'active' : ''}`} onClick={closeMenu} />
                <div className={`mobile-side-drawer ${isMenuOpen ? 'active' : ''}`}>
                    {/* Header inside drawer */}
                    <div className="drawer-header">
                        <Link href="/" className="drawer-logo-link" onClick={closeMenu}>
                            <img src="/menu_logo.png" alt="Mauro Mera" className="drawer-logo" />
                        </Link>
                        <button onClick={closeMenu} className="drawer-close-btn" aria-label="Close menu">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    </div>

                    {/* Menu Items */}
                    <nav className="drawer-nav">
                        <MobileNavLinks isLoggedIn={isAuthenticated} onClick={closeMenu} currentPath={pathname} />
                    </nav>
                </div>
            </div>
        </header>
    );
}

// Desktop NavLinks (original behavior)
function DesktopNavLinks({ isLoggedIn, currentPath }: { isLoggedIn: boolean, currentPath?: string }) {
    const isActive = (path: string) => currentPath === path ? "active" : "";

    return (
        <>
            <Link href="/" className={`nav-link ${isActive("/")}`}>Inicio</Link>
            <Link href="/portafolio" className={`nav-link ${isActive("/portafolio")}`}>Portafolio</Link>
            <Link href="/formacion" className={`nav-link ${isActive("/formacion")}`}>Cursos</Link>
            <Link href="/blog" className={`nav-link ${isActive("/blog")}`}>Blog</Link>
            <Link href="/ebooks" className={`nav-link ${isActive("/ebooks")}`}>E-books</Link>
            <Link href="/servicios" className={`nav-link ${isActive("/servicios")}`} style={{ fontWeight: 500 }}>Servicios</Link>

            {isLoggedIn ? (
                <Link href="/perfil" className="btn btn-primary" style={{ padding: "0.5rem 1.2rem", fontSize: "0.9rem", fontFamily: "var(--font-serif)", fontWeight: 600 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "0.5rem" }}>
                        <rect x="3" y="3" width="7" height="7" />
                        <rect x="14" y="3" width="7" height="7" />
                        <rect x="14" y="14" width="7" height="7" />
                        <rect x="3" y="14" width="7" height="7" />
                    </svg>
                    Mi Panel
                </Link>
            ) : (
                <>
                    <Link href="/registro" className="btn btn-secondary" style={{ padding: "0.5rem 1.2rem", fontSize: "0.9rem", fontFamily: "var(--font-serif)", fontWeight: 600 }}>
                        Registrarse
                    </Link>
                    <Link href="/login" className="btn btn-primary" style={{ padding: "0.5rem 1.2rem", fontSize: "0.9rem", fontFamily: "var(--font-serif)", fontWeight: 600 }}>
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

// Mobile NavLinks - Fivewoods style with arrow icons
function MobileNavLinks({ onClick, isLoggedIn, currentPath }: { onClick?: () => void, isLoggedIn: boolean, currentPath?: string }) {
    const isActive = (path: string) => currentPath === path ? "active" : "";

    const ArrowIcon = () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="menu-arrow">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
        </svg>
    );

    return (
        <>
            <Link href="/" onClick={onClick} className={`mobile-nav-item ${isActive("/")}`}>
                <span>Inicio</span>
                <ArrowIcon />
            </Link>
            <Link href="/portafolio" onClick={onClick} className={`mobile-nav-item ${isActive("/portafolio")}`}>
                <span>Portafolio</span>
                <ArrowIcon />
            </Link>
            <Link href="/formacion" onClick={onClick} className={`mobile-nav-item ${isActive("/formacion")}`}>
                <span>Cursos</span>
                <ArrowIcon />
            </Link>
            <Link href="/blog" onClick={onClick} className={`mobile-nav-item ${isActive("/blog")}`}>
                <span>Blog</span>
                <ArrowIcon />
            </Link>
            <Link href="/ebooks" onClick={onClick} className={`mobile-nav-item ${isActive("/ebooks")}`}>
                <span>E-books</span>
                <ArrowIcon />
            </Link>
            <Link href="/servicios" onClick={onClick} className={`mobile-nav-item ${isActive("/servicios")}`}>
                <span>Servicios</span>
                <ArrowIcon />
            </Link>

            {/* Login button with accent - NO Registro button on mobile */}
            {isLoggedIn ? (
                <Link href="/perfil" onClick={onClick} className="mobile-nav-cta">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="7" height="7" />
                        <rect x="14" y="3" width="7" height="7" />
                        <rect x="14" y="14" width="7" height="7" />
                        <rect x="3" y="14" width="7" height="7" />
                    </svg>
                    <span>Mi Panel</span>
                </Link>
            ) : (
                <Link href="/login" onClick={onClick} className="mobile-nav-cta">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                    </svg>
                    <span>Iniciar sesión</span>
                </Link>
            )}
        </>
    );
}
