"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import {
    IconMenu,
    IconClose,
    IconUser,
    IconLogin,
    IconArrowRight,
} from "@/app/components/ui/Icons";
import styles from "@/app/styles/header.module.css";

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();

    const { isAuthenticated } = useAuth();

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
        <header className={styles.siteHeader}>
            <div className={styles.headerContainer}>
                {/* Mobile: Hamburger LEFT */}
                <div className={styles.headerMobileToggle}>
                    <button
                        onClick={toggleMenu}
                        className={styles.hamburgerBtn}
                        aria-label="Toggle menu"
                    >
                        <IconMenu size={28} />
                    </button>
                </div>

                {/* Logo - Wide logo for both desktop and mobile */}
                <Link href="/" className={styles.headerLogoLink} onClick={closeMenu}>
                    <img
                        src="/menu_logo.png"
                        alt="Mauro Mera"
                        className={styles.headerLogo}
                    />
                </Link>

                {/* Desktop Nav */}
                <nav className={styles.navDesktop}>
                    <DesktopNavLinks isLoggedIn={isAuthenticated} currentPath={pathname} />
                </nav>

                {/* Mobile Side Drawer - From LEFT */}
                <div
                    className={`${styles.mobileMenuOverlay} ${isMenuOpen ? styles.mobileMenuOverlayActive : ''}`}
                    onClick={closeMenu}
                />
                <div className={`${styles.mobileSideDrawer} ${isMenuOpen ? styles.mobileSideDrawerActive : ''}`}>
                    {/* Close button only - no logo in drawer */}
                    <div className={styles.drawerHeader}>
                        <button onClick={closeMenu} className={styles.drawerCloseBtn} aria-label="Close menu">
                            <IconClose size={24} />
                        </button>
                    </div>

                    {/* Menu Items */}
                    <nav className={styles.drawerNav}>
                        <MobileNavLinks isLoggedIn={isAuthenticated} onClick={closeMenu} currentPath={pathname} />
                    </nav>
                </div>
            </div>
        </header>
    );
}

// Desktop NavLinks (original behavior)
function DesktopNavLinks({ isLoggedIn, currentPath }: { isLoggedIn: boolean, currentPath?: string }) {
    const isActive = (path: string) => currentPath === path ? styles.navLinkActive : "";

    return (
        <>
            <Link href="/" className={`${styles.navLink} ${isActive("/")}`}>Inicio</Link>
            <Link href="/portafolio" className={`${styles.navLink} ${isActive("/portafolio")}`}>Portafolio</Link>
            <Link href="/formacion" className={`${styles.navLink} ${isActive("/formacion")}`}>Cursos</Link>
            <Link href="/blog" className={`${styles.navLink} ${isActive("/blog")}`}>Blog</Link>
            <Link href="/ebooks" className={`${styles.navLink} ${isActive("/ebooks")}`}>E-books</Link>
            <Link href="/servicios" className={`${styles.navLink} ${isActive("/servicios")}`}>Servicios</Link>

            {isLoggedIn ? (
                <Link href="/perfil" className="btn btn-primary btn-sm">
                    <IconUser size={18} style={{ marginRight: "0.5rem" }} />
                    Mi Panel
                </Link>
            ) : (
                <>
                    <Link href="/registro" className="btn btn-secondary btn-sm">
                        Registrarse
                    </Link>
                    <Link href="/login" className="btn btn-primary btn-sm">
                        <IconLogin size={18} style={{ marginRight: "0.5rem" }} />
                        Iniciar sesión
                    </Link>
                </>
            )}
        </>
    );
}

// Mobile NavLinks - Fivewoods style with arrow icons
function MobileNavLinks({ onClick, isLoggedIn, currentPath }: { onClick?: () => void, isLoggedIn: boolean, currentPath?: string }) {
    const isActive = (path: string) => currentPath === path ? styles.mobileNavItemActive : "";

    return (
        <>
            <Link href="/" onClick={onClick} className={`${styles.mobileNavItem} ${isActive("/")}`}>
                <span>Inicio</span>
                <IconArrowRight className={styles.menuArrow} size={20} />
            </Link>
            <Link href="/portafolio" onClick={onClick} className={`${styles.mobileNavItem} ${isActive("/portafolio")}`}>
                <span>Portafolio</span>
                <IconArrowRight className={styles.menuArrow} size={20} />
            </Link>
            <Link href="/formacion" onClick={onClick} className={`${styles.mobileNavItem} ${isActive("/formacion")}`}>
                <span>Cursos</span>
                <IconArrowRight className={styles.menuArrow} size={20} />
            </Link>
            <Link href="/blog" onClick={onClick} className={`${styles.mobileNavItem} ${isActive("/blog")}`}>
                <span>Blog</span>
                <IconArrowRight className={styles.menuArrow} size={20} />
            </Link>
            <Link href="/ebooks" onClick={onClick} className={`${styles.mobileNavItem} ${isActive("/ebooks")}`}>
                <span>E-books</span>
                <IconArrowRight className={styles.menuArrow} size={20} />
            </Link>
            <Link href="/servicios" onClick={onClick} className={`${styles.mobileNavItem} ${isActive("/servicios")}`}>
                <span>Servicios</span>
                <IconArrowRight className={styles.menuArrow} size={20} />
            </Link>

            {/* Login button with accent - NO Registro button on mobile */}
            {isLoggedIn ? (
                <Link href="/perfil" onClick={onClick} className={styles.mobileNavCta}>
                    <IconUser size={20} />
                    <span>Mi Panel</span>
                </Link>
            ) : (
                <Link href="/login" onClick={onClick} className={styles.mobileNavCta}>
                    <IconLogin size={20} />
                    <span>Iniciar sesión</span>
                </Link>
            )}
        </>
    );
}
