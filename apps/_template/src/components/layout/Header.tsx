"use client";

import { useAuth } from "@/hooks";
import { usePathname } from "next/navigation";
import { SiteHeader } from "@alvarosky/ui";
import { CartSheet } from "@/components/shop/cart-sheet";
import { siteConfig } from "@/config/site";

export function Header({ hasDashboardFeature = true, logo }: { hasDashboardFeature?: boolean, logo?: string }) {
    const pathname = usePathname();
    const { isAuthenticated } = useAuth();

    const navLinks = [
        { label: "Inicio", href: "/" },
        { label: "Quien Soy", href: "/quien-soy" },
        { label: "Logros", href: "/logros" },
        { label: "Servicios", href: "/servicios" },
        { label: "Tienda", href: "/tienda" },
        { label: "Blog", href: "/blog" },
        { label: "Emprende", href: "/emprende" },
        { label: "Mi Cuenta", href: "/perfil" },
    ];

    const isHome = pathname === "/";
    const finalLogo = logo || siteConfig.branding.logo;

    return (
        <SiteHeader
            logo={finalLogo}
            logoAlt={siteConfig.branding.logoAlt}
            links={navLinks}
            isAuthenticated={isAuthenticated}
            pathname={pathname}
            cartComponent={<CartSheet />}
            showAuthButtons={false}
            transparentIsDark={isHome}
        />
    );
}

