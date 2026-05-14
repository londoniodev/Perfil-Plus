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
    links?: NavLink[];
    hideHeader?: boolean;
    hideFooter?: boolean;
    primaryColor?: string;
    forceDark?: boolean;
    hideThemeToggle?: boolean;
    hideCart?: boolean;
}

export function NavigationWrapper({ 
    children, 
    footer, 
    showAuthButtons = true, 
    logo,
    links,
    hideHeader = false,
    hideFooter = false,
    primaryColor,
    forceDark = false,
    hideThemeToggle = false,
    hideCart = false,
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

    // Menú público del restaurante y checkout - sin header/footer
    const isMenuPage = pathname === "/menu" || pathname?.endsWith("/menu");
    const isCheckoutPage = pathname?.startsWith("/checkout");

    // Dashboard, Auth, Menu and Checkout pages don't show Header/Footer
    if (isDashboard || isAuthPage || isMenuPage || isCheckoutPage) {
        return <>{children}</>;
    }

    return (
        <>
            {!hideHeader && (
                <Header 
                    showAuthButtons={showAuthButtons} 
                    logo={logo} 
                    links={links}
                    primaryColor={primaryColor}
                    forceDark={forceDark}
                    hideThemeToggle={hideThemeToggle}
                    hideCart={hideCart}
                />
            )}
            <main>{children}</main>
            {!hideFooter && footer}
        </>
    );
}

