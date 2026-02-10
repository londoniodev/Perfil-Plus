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
    links: NavLink[];
    isAuthenticated?: boolean;
    pathname?: string;
    cartComponent?: React.ReactNode;
    loginUrl?: string;
    registerUrl?: string;
    profileUrl?: string;
    className?: string;
}

export function SiteHeader({
    logo,
    logoAlt = "Logo",
    links,
    isAuthenticated = false,
    pathname = "",
    cartComponent,
    loginUrl = "/login",
    registerUrl = "/registro",
    profileUrl = "/perfil",
    className,
}: SiteHeaderProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const isScrolled = useScroll(10);

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
                            <Button variant="ghost" size="icon" className="text-foreground">
                                <IconMenu size={28} />
                                <span className="sr-only">Menú</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0 border-r border-border bg-background">
                            <SheetHeader className="p-4 border-b border-border flex items-center justify-between">
                                <SheetTitle className="text-left">Menú</SheetTitle>
                            </SheetHeader>
                            <div className="py-2">
                                <MobileNavLinks
                                    links={links}
                                    isLoggedIn={isAuthenticated}
                                    onClick={() => setIsMenuOpen(false)}
                                    currentPath={pathname}
                                    loginUrl={loginUrl}
                                    profileUrl={profileUrl}
                                />
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>

                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 z-10 lg:ml-4">
                    <Image
                        src={logo}
                        alt={logoAlt}
                        width={100}
                        height={40}
                        className="h-8 md:h-10 w-auto object-contain"
                        priority
                    />
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
                    />
                </nav>

                {/* Cart Button (Desktop & Mobile) */}
                <div className="flex items-center gap-2 mr-2">
                    {cartComponent}
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
}

function DesktopNavLinks({ links, isLoggedIn, currentPath, loginUrl, registerUrl, profileUrl }: DesktopNavLinksProps) {
    const linkClass = (path: string) => cn(
        "text-base font-medium transition-colors hover:text-accent",
        currentPath === path ? "text-accent font-semibold" : "text-foreground/80"
    );

    return (
        <>
            {links.map((link) => (
                <Link key={link.href} href={link.href} className={linkClass(link.href)}>
                    {link.label}
                </Link>
            ))}

            <div className="pl-4 border-l border-border flex gap-2">
                {isLoggedIn ? (
                    <Button asChild size="sm" className="bg-accent hover:bg-accent/90 text-white border-0">
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
}

function MobileNavLinks({ links, onClick, isLoggedIn, currentPath, loginUrl, profileUrl }: MobileNavLinksProps) {
    const linkClass = (path: string) => cn(
        "flex items-center justify-between w-full p-4 text-lg font-medium border-b border-border/50 hover:bg-accent/5 transition-colors",
        currentPath === path ? "text-accent bg-accent/10 font-bold" : "text-foreground"
    );

    return (
        <div className="flex flex-col h-full overflow-y-auto">
            {links.map((link, index) => (
                <Link
                    key={link.href}
                    href={link.href}
                    onClick={onClick}
                    className={linkClass(link.href)}
                >
                    <span>{link.label}</span>
                    <IconArrowRight size={18} className="text-muted-foreground opacity-50" />
                </Link>
            ))}

            <div className="p-4 mt-auto">
                {isLoggedIn ? (
                    <Button asChild className="w-full justify-start bg-accent hover:bg-accent/90 text-white" size="lg">
                        <Link href={profileUrl} onClick={onClick}>
                            <IconUser size={20} className="mr-2" />
                            Mi Panel
                        </Link>
                    </Button>
                ) : (
                    <Button asChild className="w-full justify-start bg-primary hover:bg-primary/90 text-primary-foreground" size="lg">
                        <Link href={loginUrl} onClick={onClick}>
                            <IconLogin size={20} className="mr-2" />
                            Entrar
                        </Link>
                    </Button>
                )}
            </div>
        </div>
    );
}
