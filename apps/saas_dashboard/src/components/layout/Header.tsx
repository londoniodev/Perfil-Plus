"use client";

import { useAuth } from "@/hooks";
import { usePathname } from "next/navigation";
import { SiteHeader } from "@alvarosky/ui";
import { CartSheet } from "@/components/shop/cart-sheet";
import { BranchSelector } from "./BranchSelector";
import { siteConfig } from "@/config/site";

interface HeaderProps {
    tenantName?: string;
    logoUrl?: string;
}

export function Header({ tenantName, logoUrl }: HeaderProps) {
    const pathname = usePathname();
    const { isAuthenticated } = useAuth();

    const navLinks = [
        { label: "Inicio", href: "/" },
        { label: "Empresas", href: "/empresas" },
        { label: "Cursos", href: "/cursos" },
        { label: "Blog", href: "/blog" },
        { label: "Tienda", href: "/menu" },
    ];

    const finalLogo = logoUrl || siteConfig.branding.logo;
    // Si el logo es una URL externa (https://), marcar como unoptimized para Next/Image
    const isExternal = finalLogo.startsWith("http");

    return (
        <SiteHeader
            logo={finalLogo}
            logoAlt={tenantName || siteConfig.branding.logoAlt}
            logoUnoptimized={isExternal}
            links={navLinks}
            isAuthenticated={isAuthenticated}
            pathname={pathname}
            logoSuffix={<BranchSelector />}
            cartComponent={<CartSheet />}
        />
    );
}
