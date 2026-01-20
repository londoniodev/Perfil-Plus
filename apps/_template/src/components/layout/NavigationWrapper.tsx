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
        pathname?.startsWith("/dashboard");

    const isAuthPage = pathname === "/login" ||
        pathname === "/registro" ||
        pathname?.startsWith("/auth");

    // Dashboard and Auth pages don't show Header/Footer
    if (isDashboard || isAuthPage) {
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

