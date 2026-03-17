"use client";

import { usePathname } from "next/navigation";
import { Header } from "./Header";

interface NavLink {
    label: string;
    href: string;
}

interface NavigationWrapperProps {
    children: React.ReactNode;
    footer: React.ReactNode;
    showAuthButtons?: boolean;
    logo?: string;
    logoSuffix?: React.ReactNode;
    links?: NavLink[];
    isCocinaSiete?: boolean;
}

export function NavigationWrapper({ 
    children, 
    footer, 
    showAuthButtons = true, 
    logo,
    logoSuffix,
    links,
    isCocinaSiete
}: NavigationWrapperProps) {
    const pathname = usePathname();

    // Rutas que usan el Layout del Dashboard (Sidebar/BottomNav) y NO deben tener Header/Footer
    const isDashboard = pathname?.startsWith("/perfil") ||
        pathname?.startsWith("/dashboard") ||
        pathname?.includes("/mis-compras") ||
        pathname?.startsWith("/suscripcion") ||
        pathname?.startsWith("/waiter") ||
        pathname?.startsWith("/kitchen");

    const isAuthPage = pathname === "/login" ||
        pathname === "/registro" ||
        pathname?.startsWith("/auth");

    // Menú público del restaurante - sin header/footer
    const isMenuPage = pathname === "/menu" || pathname?.endsWith("/menu");

    // Dashboard, Auth and Menu pages don't show Header/Footer
    if (isDashboard || isAuthPage || isMenuPage) {
        return <>{children}</>;
    }

    return (
        <>
            <Header 
                showAuthButtons={showAuthButtons} 
                logo={logo} 
                logoSuffix={logoSuffix} 
                links={links}
                isCocinaSiete={isCocinaSiete}
            />
            <main>{children}</main>
            {footer}
        </>
    );
}

