"use client";

import { useAuth } from "@/hooks";
import { usePathname } from "next/navigation";
import { SiteHeader } from "@alvarosky/ui";
import { CartSheet } from "@/components/shop/cart-sheet";
import { siteConfig } from "@/config/site";
import { useTenant } from "@/app/providers";

export function Header() {
    const pathname = usePathname();
    const { isAuthenticated } = useAuth();
    const { features } = useTenant();

    const hasDashboard = features?.includes("dashboard") || features?.includes("DASHBOARD");

    const navLinks = [
        { label: "Inicio", href: "/" },
        { label: "Portafolio", href: "/portafolio" },
        { label: "Cursos", href: "/formacion" },
        { label: "Blog", href: "/blog" },
        { label: "Tienda", href: "/tienda" },
        { label: "Servicios", href: "/servicios" },
    ];

    return (
        <SiteHeader
            logo={siteConfig.branding.logo}
            logoAlt={siteConfig.branding.logoAlt}
            logoUnoptimized
            links={navLinks}
            isAuthenticated={isAuthenticated}
            pathname={pathname}
            cartComponent={<CartSheet />}
            showAuthButtons={hasDashboard}
        />
    );
}
