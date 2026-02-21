"use client";

import { usePathname } from "next/navigation";
import { Header } from "./Header";

export function NavigationWrapper({ children, footer }: { children: React.ReactNode, footer: React.ReactNode }) {
    const pathname = usePathname();

    // Rutas que usan el Layout del Dashboard (Sidebar/BottomNav) y NO deben tener Header/Footer
    const isDashboard = pathname?.startsWith("/perfil") ||
        pathname?.startsWith("/admin") ||
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

    // Landing page tiene su propio Nav/Footer personalizado
    const isLandingPage = pathname === "/";

    // Dashboard, Auth, Menu and Landing pages don't show Header/Footer
    if (isDashboard || isAuthPage || isMenuPage || isLandingPage) {
        return <>{children}</>;
    }

    return (
        <>
            <Header />
            <main>{children}</main>
            {footer}
        </>
    );
}

