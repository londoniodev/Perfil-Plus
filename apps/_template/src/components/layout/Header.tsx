"use client";
import * as React from "react";

import { useAuth } from "@/hooks";
import { usePathname } from "next/navigation";
import { SiteHeader } from "@alvarosky/ui";
import { CartSheet } from "@/components/shop/cart-sheet";
import { siteConfig } from "@/config/site";

interface NavLink {
    label: string;
    href: string;
}

interface HeaderProps {
    logo?: string;
    links?: NavLink[];
    showAuthButtons?: boolean;
    primaryColor?: string;
    forceDark?: boolean;
}

export function Header({ 
    logo, 
    links = [], 
    showAuthButtons = true,
    primaryColor,
    forceDark,
}: HeaderProps) {
    const pathname = usePathname();
    const { isAuthenticated } = useAuth();
    const [isScrolled, setIsScrolled] = React.useState(false);

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const isHome = pathname === "/";
    const finalLogo = logo || siteConfig.branding.logo;

    return (
        <SiteHeader
            logo={finalLogo}
            logoAlt={siteConfig.branding.logoAlt}
            links={links}
            isAuthenticated={isAuthenticated}
            pathname={pathname}
            cartComponent={<CartSheet />}
            showAuthButtons={showAuthButtons}
            transparentIsDark={true} // Siempre letras blancas al ser tema oscuro
            forceDark={true} // Forzar texto blanco para contraste en tema oscuro
            className={`transition-all duration-700 ease-in-out ${
                isScrolled 
                ? "opacity-100 translate-y-0" 
                : "opacity-0 -translate-y-10 pointer-events-none"
            }`}
        />
    );
}

