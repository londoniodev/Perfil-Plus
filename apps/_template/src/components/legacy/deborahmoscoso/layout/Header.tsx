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
        { label: "Programas", href: "/servicios" },
        { label: "Tienda", href: "/tienda" },
        { label: "Blog", href: "/blog" },
        { label: "Cursos", href: "/formacion" },
    ];

    return (
        <SiteHeader
            logo={siteConfig.branding.logo}
            logoAlt={siteConfig.branding.logoAlt}
            logoSuffix={
                <span className="text-lg md:text-xl font-black tracking-tighter uppercase italic leading-none hidden sm:block">
                    Soy <span className="text-fuchsia-500">Deborah</span> Soy Saludable
                </span>
            }
            links={navLinks}
            isAuthenticated={isAuthenticated}
            pathname={pathname}
            cartComponent={<CartSheet />}
        />
    );
}

