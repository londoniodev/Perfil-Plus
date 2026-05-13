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
            transparentIsDark={true}
            forceDark={true}
            className={`transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isScrolled 
                ? "bg-black/95 backdrop-blur-xl border-b border-white/10 shadow-2xl" 
                : "bg-black/70 backdrop-blur-sm"
            }`}
        />
    );
}

