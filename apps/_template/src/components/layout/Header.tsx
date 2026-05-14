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
    hideThemeToggle?: boolean;
    hideCart?: boolean;
}

export function Header({ 
    logo, 
    links = [], 
    showAuthButtons = true,
    primaryColor,
    forceDark = false,
    hideThemeToggle = false,
    hideCart = false,
}: HeaderProps) {
    const pathname = usePathname();
    const { isAuthenticated } = useAuth();

    const finalLogo = logo || siteConfig.branding.logo;

    return (
        <SiteHeader
            logo={finalLogo}
            logoAlt={siteConfig.branding.logoAlt}
            links={links}
            isAuthenticated={isAuthenticated}
            pathname={pathname}
            cartComponent={hideCart ? undefined : <CartSheet />}
            showAuthButtons={showAuthButtons}
            transparentIsDark={forceDark}
            forceDark={forceDark}
            hideThemeToggle={hideThemeToggle}
        />
    );
}
