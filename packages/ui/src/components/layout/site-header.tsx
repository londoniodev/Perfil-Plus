"use client";

import Link from "next/link";
import React, { useState } from "react";
import Image from "next/image";
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
    className,
}: SiteHeaderProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const isScrolled = useScroll(10);

    const isWhiteText = !isScrolled && transparentIsDark;

    return (
        <header className={cn(
            "fixed top-0 left-0 w-full z-50 transition-all duration-300",
            isScrolled ? "bg-background/80 backdrop-blur-md border-b border-border shadow-sm py-3" : "bg-transparent py-6",
            className
        )}>
            <div className="w-full px-4 md:px-8 flex items-center justify-between">

                {/* Mobile Trigger (Left) */}
                <div className="lg:hidden ml-2">
                    <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className={cn(!isScrolled ? "text-black" : "text-foreground", isWhiteText && !isScrolled ? "text-white" : "")}>
                                <IconMenu size={28} />
                                <span className="sr-only">Menú</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0 border-r border-zinc-200 bg-zinc-50">
                            <SheetHeader className="p-4 border-b border-zinc-200 flex items-center justify-between">
                                <SheetTitle className="text-left text-zinc-900">Menú</SheetTitle>
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

                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 z-10 lg:ml-4 group">
                    <Image
                        src={logo}
                        alt={logoAlt}
                        width={200}
                        height={80}
                        className={cn("h-8 md:h-10 w-auto object-contain rounded-full transition-all group-hover:scale-105", isWhiteText && "brightness-0 invert")}
                        priority
                        unoptimized={logoUnoptimized}
                    />
                    {logoSuffix}
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden lg:flex items-center gap-8">
                    <DesktopNavLinks
                        links={links}
                        isLoggedIn={isAuthenticated}
                        currentPath={pathname}
                        loginUrl={loginUrl}
                        registerUrl={registerUrl}
                        profileUrl={profileUrl}
                        showAuthButtons={showAuthButtons}
                        isWhiteText={isWhiteText}
                    />
                </nav>

                {/* Cart Button (Desktop & Mobile) */}
                <div className="flex items-center gap-2 mr-2">
                    <div className={cn(isWhiteText && "text-white")}>
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
}

function DesktopNavLinks({ links, isLoggedIn, currentPath, loginUrl, registerUrl, profileUrl, showAuthButtons = true, isWhiteText = false }: DesktopNavLinksProps) {
    const linkClass = (path: string) => cn(
        "text-base font-medium transition-colors hover:text-primary",
        currentPath === path ? "text-primary font-bold" : (isWhiteText ? "text-white/90" : "text-foreground/80")
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
                            <Button asChild variant="ghost" size="sm" className="hidden xl:inline-flex text-foreground hover:text-accent">
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
        "flex items-center justify-between w-full p-4 text-lg font-medium border-b border-zinc-200 hover:bg-primary/5 transition-colors",
        currentPath === path ? "text-primary bg-primary/10 font-bold" : "text-zinc-900"
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
                    <IconArrowRight size={18} className={cn("transition-all", currentPath === link.href ? "text-primary translate-x-1" : "text-muted-foreground opacity-50")} />
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
