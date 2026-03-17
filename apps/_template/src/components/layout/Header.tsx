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
    const { features, headerLinks, tenantId } = useTenant();

    // Hacemos una copia para no mutar el array original del context
    let navLinks = headerLinks ? [...headerLinks] : [];

    // Fallback: Si no hay base de datos de menús configurada, se genera plug & play basado en Features
    if (navLinks.length === 0) {
        navLinks = [{ label: "Inicio", href: "/" }];
        if (features.some(f => f.toUpperCase() === "ECOMMERCE" || f.toUpperCase() === "ECOMERCE")) navLinks.push({ label: "Tienda", href: "/tienda" });
        if (features.includes("LMS")) navLinks.push({ label: "Cursos", href: "/formacion" });
        if (features.includes("BLOG")) navLinks.push({ label: "Blog", href: "/blog" });
        if (features.includes("RESTAURANT")) navLinks.push({ label: "Menú", href: "/menu" });
    } else {
        // Validación forzosa para E-commerce. Si la DB omitió incluir "Tienda", pero el Tenant tiene el feature, the lo forzamos.
        const hasEcommerceFeature = features.some(f => f.toUpperCase() === "ECOMMERCE" || f.toUpperCase() === "ECOMERCE");
        const hasTiendaLink = navLinks.some(link => link.href === "/tienda");
        
        if (hasEcommerceFeature && !hasTiendaLink) {
            navLinks.push({ label: "Tienda", href: "/tienda" });
        }
    }

    const hasDashboard = features.some(f => f.toUpperCase() === "DASHBOARD");
    const isHome = pathname === "/";
    const isCocinaSiete = tenantId === "cocinasiete";
    const finalLogo = logo || siteConfig.branding.logo;

    return (
        <SiteHeader
            logo={finalLogo}
            logoAlt={siteConfig.branding.logoAlt}
            links={navLinks}
            isAuthenticated={isAuthenticated}
            pathname={pathname}
            cartComponent={<CartSheet />}
            showAuthButtons={hasDashboard && !isCocinaSiete}
            transparentIsDark={isHome && !isCocinaSiete}
        />
    );
}

