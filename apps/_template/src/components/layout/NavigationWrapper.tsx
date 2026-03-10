"use client";

import { usePathname } from "next/navigation";
import { Header } from "./Header";

export function NavigationWrapper({ children, footer, hasDashboardFeature = true, logo }: { children: React.ReactNode, footer: React.ReactNode, hasDashboardFeature?: boolean, logo?: string }) {
    const pathname = usePathname();

    // Rutas que usan el Layout del Dashboard (Sidebar/BottomNav) y NO deben tener Header/Footer
    const isDashboard = pathname?.startsWith("/perfil") ||
        pathname?.startsWith("/dashboard") ||
        pathname?.includes("/mis-compras") ||
        pathname?.startsWith("/cursos") || // Mis Cursos (LMS)
        pathname?.startsWith("/suscripcion") ||
        pathname?.startsWith("/waiter") ||
        pathname?.startsWith("/kitchen") ||
        pathname?.startsWith("/dashboard");

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
            <Header hasDashboardFeature={hasDashboardFeature} logo={logo} />
            <main>{children}</main>
            {footer}
        </>
    );
}

