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
    logoSuffix?: React.ReactNode;
    links?: NavLink[];
    showAuthButtons?: boolean;
    isCocinaSiete?: boolean;
}

export function Header({ 
    logo, 
    logoSuffix, 
    links = [], 
    showAuthButtons = true,
    isCocinaSiete = false
}: HeaderProps) {
    const pathname = usePathname();
    const { isAuthenticated } = useAuth();

    const isHome = pathname === "/";
    const finalLogo = logo || siteConfig.branding.logo;

    return (
        <SiteHeader
            logo={finalLogo}
            logoAlt={siteConfig.branding.logoAlt}
            logoSuffix={logoSuffix}
            links={links}
            isAuthenticated={isAuthenticated}
            pathname={pathname}
            cartComponent={<CartSheet />}
            showAuthButtons={showAuthButtons && !isCocinaSiete}
            transparentIsDark={isHome && !isCocinaSiete}
        />
    );
}

