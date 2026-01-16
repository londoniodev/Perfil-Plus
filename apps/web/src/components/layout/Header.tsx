"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth, useScroll } from "@/hooks";
import { usePathname } from "next/navigation";
import {
    IconMenu,
    IconClose,
    IconUser,
    IconLogin,
    IconArrowRight,
} from "@/components/ui/Icons";
import { Button } from "@/components/ui/Button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();
    const { isAuthenticated } = useAuth();
    const isScrolled = useScroll(10);

    return (
        <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? "bg-background/80 backdrop-blur-md border-b border-border shadow-sm py-3" : "bg-transparent py-6"}`}>
            <div className="container flex items-center justify-between">

                {/* Mobile Trigger (Left) */}
                <div className="lg:hidden">
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
                                {/* Sheet has built-in close button usually, but we can keep explicit if needed or rely on Sheet's default */}
                            </SheetHeader>
                            <div className="py-2">
                                <MobileNavLinks isLoggedIn={isAuthenticated} onClick={() => setIsMenuOpen(false)} currentPath={pathname} />
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>

                {/* Logo (Centered on mobile if desired, or left) */}
                <Link href="/" className="flex items-center gap-2 z-10">
                    <img
                        src="/images/branding/menu_logo.png"
                        alt="Mauro Mera"
                        className="h-8 w-auto md:h-10"
                    />
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden lg:flex items-center gap-8">
                    <DesktopNavLinks isLoggedIn={isAuthenticated} currentPath={pathname} />
                </nav>

                {/* Mobile: Spacer or Action (optional, to balance layout) */}
                <div className="lg:hidden w-10"></div>
            </div>
        </header>
    );
}

// Desktop NavLinks
function DesktopNavLinks({ isLoggedIn, currentPath }: { isLoggedIn: boolean, currentPath?: string }) {
    const linkClass = (path: string) => `text-base font-medium transition-colors hover:text-accent ${currentPath === path ? "text-accent" : "text-foreground/80"}`;

    return (
        <>
            <Link href="/" className={linkClass("/")}>Inicio</Link>
            <Link href="/portafolio" className={linkClass("/portafolio")}>Portafolio</Link>
            <Link href="/formacion" className={linkClass("/formacion")}>Cursos</Link>
            <Link href="/blog" className={linkClass("/blog")}>Blog</Link>
            <Link href="/ebooks" className={linkClass("/ebooks")}>E-books</Link>
            <Link href="/servicios" className={linkClass("/servicios")}>Servicios</Link>

            <div className="pl-4 border-l border-border flex gap-2">
                {isLoggedIn ? (
                    <Button asChild size="sm" className="bg-accent hover:bg-accent/90 text-white border-0">
                        <Link href="/perfil">
                            <IconUser size={18} className="mr-2" />
                            Mi Panel
                        </Link>
                    </Button>
                ) : (
                    <>
                        <Button asChild variant="ghost" size="sm" className="hidden xl:inline-flex text-foreground hover:text-accent">
                            <Link href="/registro">Registrarse</Link>
                        </Button>
                        <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-white border-0">
                            <Link href="/login">
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
function MobileNavLinks({ onClick, isLoggedIn, currentPath }: { onClick?: () => void, isLoggedIn: boolean, currentPath?: string }) {
    const linkClass = (path: string) => `flex items-center justify-between w-full p-4 text-lg font-medium border-b border-border/50 hover:bg-accent/5 transition-colors ${currentPath === path ? "text-accent bg-accent/5" : "text-foreground"}`;

    return (
        <div className="flex flex-col h-full overflow-y-auto">
            <Link href="/" onClick={onClick} className={`${linkClass("/")} animate-slide-in-left`} style={{ animationDelay: "100ms" }}>
                <span>Inicio</span>
                <IconArrowRight size={18} className="text-muted-foreground opacity-50" />
            </Link>
            <Link href="/portafolio" onClick={onClick} className={`${linkClass("/portafolio")} animate-slide-in-left`} style={{ animationDelay: "150ms" }}>
                <span>Portafolio</span>
                <IconArrowRight size={18} className="text-muted-foreground opacity-50" />
            </Link>
            <Link href="/formacion" onClick={onClick} className={`${linkClass("/formacion")} animate-slide-in-left`} style={{ animationDelay: "200ms" }}>
                <span>Cursos</span>
                <IconArrowRight size={18} className="text-muted-foreground opacity-50" />
            </Link>
            <Link href="/blog" onClick={onClick} className={`${linkClass("/blog")} animate-slide-in-left`} style={{ animationDelay: "300ms" }}>
                <span>Blog</span>
                <IconArrowRight size={18} className="text-muted-foreground opacity-50" />
            </Link>
            <Link href="/ebooks" onClick={onClick} className={`${linkClass("/ebooks")} animate-slide-in-left`} style={{ animationDelay: "500ms" }}>
                <span>E-books</span>
                <IconArrowRight size={18} className="text-muted-foreground opacity-50" />
            </Link>
            <Link href="/servicios" onClick={onClick} className={`${linkClass("/servicios")} animate-slide-in-left`} style={{ animationDelay: "700ms" }}>
                <span>Servicios</span>
                <IconArrowRight size={20} className="text-muted-foreground opacity-50" />
            </Link>

            <div className="p-4 mt-auto animate-slide-in-left" style={{ animationDelay: "700ms" }}>
                {isLoggedIn ? (
                    <Button asChild className="w-full justify-start bg-accent hover:bg-accent/90 text-white" size="lg">
                        <Link href="/perfil" onClick={onClick}>
                            <IconUser size={20} className="mr-2" />
                            Mi Panel
                        </Link>
                    </Button>
                ) : (
                    <Button asChild className="w-full justify-start bg-primary hover:bg-primary/90 text-white" size="lg">
                        <Link href="/login" onClick={onClick}>
                            <IconLogin size={20} className="mr-2" />
                            Iniciar sesión
                        </Link>
                    </Button>
                )}
            </div>
        </div>
    );
}
