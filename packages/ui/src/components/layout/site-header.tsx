"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useScroll } from "../../hooks/use-scroll";
import {
    IconMenu,
    IconUser,
    IconLogin,
    IconArrowRight,
} from "../../icons";
import { Button } from "../../button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../../sheet";
import { cn } from "../../lib/utils";

export interface NavLink {
    label: string;
    href: string;
}

export interface SiteHeaderProps {
    logo: string;
    logoAlt?: string;
    logoUnoptimized?: boolean;
    logoSuffix?: React.ReactNode;
    links: NavLink[];
    isAuthenticated?: boolean;
    pathname?: string;
    cartComponent?: React.ReactNode;
    loginUrl?: string;
    registerUrl?: string;
    profileUrl?: string;
    showAuthButtons?: boolean;
    transparentIsDark?: boolean;
    forceDark?: boolean;
    className?: string;
}

export function SiteHeader({
    logo,
    logoAlt = "Logo",
    logoUnoptimized = false,
    logoSuffix,
    links,
    isAuthenticated = false,
    pathname = "",
    cartComponent,
    loginUrl = "/login",
    registerUrl = "/registro",
    profileUrl = "/perfil",
    showAuthButtons = true,
    transparentIsDark = false,
    forceDark = false,
    className,
}: SiteHeaderProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const isScrolled = useScroll(10);
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const isWhiteText = (forceDark) || (!isScrolled && transparentIsDark);

    return (
        <header className={cn(
            "fixed top-0 left-0 w-full z-50 transition duration-300",
            forceDark ? "lg:dark lg:bg-zinc-950 lg:border-b lg:border-white/10 py-3" : "",
            !forceDark && isScrolled ? "bg-background/80 backdrop-blur-md border-b border-border shadow-sm py-3" : "",
            !forceDark && !isScrolled ? "bg-transparent py-6" : "",
            className
        )}>
            {/* Critical: inline CSS ensures responsive visibility even if Tailwind CSS chunks are not fully loaded */}
            <style dangerouslySetInnerHTML={{ __html: `
                [data-header-mobile] { display: flex !important; }
                [data-header-desktop] { display: none !important; }
                @media (min-width: 1024px) {
                    [data-header-mobile] { display: none !important; }
                    [data-header-desktop] { display: flex !important; }
                }
            `}} />
            <div className="relative w-full px-4 md:px-8 flex items-center">

                {/* Mobile Trigger (Left, Col 1 on Mobile) */}
                <div className="flex-1 flex items-center justify-start" style={{ display: 'flex' }} data-header-mobile>
                    <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className={cn(isScrolled ? "text-black" : (isWhiteText ? "text-white" : "text-foreground"))}>
                                <IconMenu size={28} />
                                <span className="sr-only">Menú</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0 border-r border-border bg-card">
                            <SheetHeader className="p-4 border-b border-border flex items-center justify-between">
                                <SheetTitle className="text-left text-card-foreground">Menú</SheetTitle>
                            </SheetHeader>
                            <div className="py-2">
                                <MobileNavLinks
                                    links={links}
                                    isLoggedIn={isAuthenticated}
                                    onClick={() => setIsMenuOpen(false)}
                                    currentPath={pathname}
                                    loginUrl={loginUrl}
                                    profileUrl={profileUrl}
                                    showAuthButtons={showAuthButtons}
                                />
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>

                {/* Logo (Col 2 on Mobile, Col 1 on Desktop) */}
                <Link href="/" className="flex-1 flex items-center justify-center gap-2 z-10 group">
                    <Image
                        src={logo}
                        alt={logoAlt}
                        width={200}
                        height={80}
                        className="h-8 md:h-10 w-auto max-w-[180px] object-contain transition group-hover:scale-105"
                        priority
                        unoptimized={logoUnoptimized}
                    />
                    {logoSuffix}
                </Link>

                {/* Desktop Nav (Col 2 on Desktop) */}
                <nav className="flex-none px-4 lg:px-8 shrink-0 items-center justify-center gap-8" style={{ display: 'none' }} data-header-desktop>
                    <DesktopNavLinks
                        links={links}
                        isLoggedIn={isAuthenticated}
                        currentPath={pathname}
                        loginUrl={loginUrl}
                        registerUrl={registerUrl}
                        profileUrl={profileUrl}
                        showAuthButtons={showAuthButtons}
                        isWhiteText={isWhiteText}
                        isScrolled={isScrolled}
                    />
                </nav>

                {/* Actions (Toggle Theme + Cart, Col 3 on Both) */}
                <div className="flex-1 flex items-center justify-end gap-1">
                    {mounted && (
                        <button 
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className={cn(
                                "inline-flex items-center justify-center rounded-full p-2 transition-colors",
                                isWhiteText ? "text-white/80 hover:bg-white/10 hover:text-white" : (isScrolled ? "text-black/70 hover:bg-black/5 hover:text-black" : "text-muted-foreground hover:bg-muted hover:text-foreground")
                            )} 
                            aria-label="Cambiar tema"
                        >
                            {theme === 'dark' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sun transition-transform duration-300"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-moon transition-transform duration-300"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
                            )}
                        </button>
                    )}
                    <div className={cn("ml-1", isWhiteText ? "text-white" : (isScrolled ? "text-black" : ""))}>
                        {cartComponent}
                    </div>
                </div>
            </div>
        </header>
    );
}

// Desktop NavLinks
interface DesktopNavLinksProps {
    links: NavLink[];
    isLoggedIn: boolean;
    currentPath: string;
    loginUrl: string;
    registerUrl: string;
    profileUrl: string;
    showAuthButtons?: boolean;
    isWhiteText?: boolean;
    isScrolled?: boolean;
}

function DesktopNavLinks({ links, isLoggedIn, currentPath, loginUrl, registerUrl, profileUrl, showAuthButtons = true, isWhiteText = false, isScrolled = false }: DesktopNavLinksProps) {
    const linkClass = (path: string) => cn(
        "text-base font-medium transition-colors hover:text-primary",
        currentPath === path ? "text-primary font-bold" : (isWhiteText ? "text-white/90" : (isScrolled ? "text-black" : "text-foreground/80"))
    );

    return (
        <>
            {links.map((link) => (
                <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                        linkClass(link.href),
                        "relative py-1 px-1 hover:text-primary transition-colors"
                    )}
                >
                    {link.label}
                    {currentPath === link.href && (
                        <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary rounded-full animate-in fade-in slide-in-from-left-1 duration-300" />
                    )}
                </Link>
            ))}

            {showAuthButtons && (
                <div className="pl-4 border-l border-border flex gap-2">
                    {isLoggedIn ? (
                        <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground border-0">
                            <Link href={profileUrl}>
                                <IconUser size={18} className="mr-2" />
                                Mi Panel
                            </Link>
                        </Button>
                    ) : (
                        <>
                            <Button asChild variant="ghost" size="sm" className={cn("hidden xl:inline-flex hover:text-accent", isScrolled ? "text-black" : "text-foreground")}>
                                <Link href={registerUrl}>Registrarse</Link>
                            </Button>
                            <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground border-0">
                                <Link href={loginUrl}>
                                    <IconLogin size={18} className="mr-2" />
                                    Entrar
                                </Link>
                            </Button>
                        </>
                    )}
                </div>
            )}
        </>
    );
}

// Mobile NavLinks
interface MobileNavLinksProps {
    links: NavLink[];
    onClick?: () => void;
    isLoggedIn: boolean;
    currentPath: string;
    loginUrl: string;
    profileUrl: string;
    showAuthButtons?: boolean;
}

function MobileNavLinks({ links, onClick, isLoggedIn, currentPath, loginUrl, profileUrl, showAuthButtons = true }: MobileNavLinksProps) {
    const linkClass = (path: string) => cn(
        "flex items-center justify-between w-full p-4 text-lg font-medium border-b border-border hover:bg-primary/5 transition-colors",
        currentPath === path ? "text-primary bg-primary/10 font-bold" : "text-card-foreground"
    );

    return (
        <div className="flex flex-col h-full overflow-y-auto">
            {links.map((link, index) => (
                <Link
                    key={link.href}
                    href={link.href}
                    onClick={onClick}
                    className={cn(
                        linkClass(link.href),
                        "relative"
                    )}
                >
                    {currentPath === link.href && (
                        <span className="absolute left-0 top-0 w-1.5 h-full bg-primary" />
                    )}
                    <span className={cn(currentPath === link.href ? "pl-2" : "")}>{link.label}</span>
                    <IconArrowRight size={18} className={cn("transition", currentPath === link.href ? "text-primary translate-x-1" : "text-muted-foreground opacity-50")} />
                </Link>
            ))}

            {showAuthButtons && (
                <div className="p-4 mt-auto">
                    {isLoggedIn ? (
                        <Button asChild className="w-full justify-start bg-primary hover:bg-primary/90 text-primary-foreground border-none shadow-md" size="lg">
                            <Link href={profileUrl} onClick={onClick}>
                                <IconUser size={20} className="mr-2" />
                                Mi Panel
                            </Link>
                        </Button>
                    ) : (
                        <Button asChild className="w-full justify-start bg-primary hover:bg-primary/90 text-primary-foreground border-none shadow-md" size="lg">
                            <Link href={loginUrl} onClick={onClick}>
                                <IconLogin size={20} className="mr-2" />
                                Entrar
                            </Link>
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}
