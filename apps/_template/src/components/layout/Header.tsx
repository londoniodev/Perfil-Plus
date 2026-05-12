"use client";

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
            transparentIsDark={isHome || forceDark}
            forceDark={forceDark}
            className=""
        />
    );
}

