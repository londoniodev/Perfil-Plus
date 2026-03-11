"use client";

import { useAuth } from "@/hooks";
import { usePathname } from "next/navigation";
import { SiteHeader } from "@alvarosky/ui";
import { CartSheet } from "@/components/shop/cart-sheet";
import { siteConfig } from "@/config/site";
import { useTenant } from "@/app/providers";
import { getTenantNavConfig } from "@/config/tenant-nav";

export function Header({ hasDashboardFeature = true, logo }: { hasDashboardFeature?: boolean, logo?: string }) {
    const pathname = usePathname();
    const { isAuthenticated } = useAuth();
    const { tenantId } = useTenant();

    const config = getTenantNavConfig(tenantId);
    const navLinks = config.header;

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

