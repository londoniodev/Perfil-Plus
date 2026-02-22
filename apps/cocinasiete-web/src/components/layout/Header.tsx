"use client";

import { useAuth } from "@/hooks";
import { usePathname } from "next/navigation";
import { SiteHeader } from "@alvarosky/ui";
import { CartSheet } from "@/components/shop/cart-sheet";
import { siteConfig } from "@/config/site";

export function Header() {
    const pathname = usePathname();
    const { isAuthenticated } = useAuth();

    const navLinks = [
        { label: "Inicio", href: "/" },
        { label: "Empresas", href: "/empresas" },
        { label: "Cursos", href: "/cursos" },
        { label: "Blog", href: "/blog" },
        { label: "Tienda", href: "/menu" },
    ];

    return (
        <SiteHeader
            logo={siteConfig.branding.logo}
            logoAlt={siteConfig.branding.logoAlt}
            links={navLinks}
            isAuthenticated={isAuthenticated}
            pathname={pathname}
            cartComponent={<CartSheet />}
        />
    );
}

