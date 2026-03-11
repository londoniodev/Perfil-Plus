"use client";

import { useAuth } from "@/hooks";
import { usePathname } from "next/navigation";
import { SiteHeader } from "@alvarosky/ui";
import { CartSheet } from "@/components/shop/cart-sheet";
import { siteConfig } from "@/config/site";
import { useTenant } from "@/app/providers";

export function Header({ hasDashboardFeature = true, logo }: { hasDashboardFeature?: boolean, logo?: string }) {
    const pathname = usePathname();
    const { isAuthenticated } = useAuth();
    const { features, headerLinks } = useTenant();

    let navLinks = headerLinks;

    // Fallback: Si no hay base de datos de menús configurada, se genera plug & play basado en Features
    if (!navLinks || navLinks.length === 0) {
        navLinks = [{ label: "Inicio", href: "/" }];
        if (features.includes("SHOP")) navLinks.push({ label: "Tienda", href: "/tienda" });
        if (features.includes("LMS")) navLinks.push({ label: "Cursos", href: "/cursos" });
        if (features.includes("BLOG")) navLinks.push({ label: "Blog", href: "/blog" });
        if (features.includes("RESTAURANT")) navLinks.push({ label: "Menú", href: "/menu" });
    }

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

