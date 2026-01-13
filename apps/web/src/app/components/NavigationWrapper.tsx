"use client";

import { usePathname } from "next/navigation";
import { Header } from "./Header";

export function NavigationWrapper({ children, footer }: { children: React.ReactNode, footer: React.ReactNode }) {
    const pathname = usePathname();

    // Rutas que usan el Layout del Dashboard (Sidebar/BottomNav) y NO deben tener Header/Footer
    const isDashboard = pathname?.startsWith("/perfil") ||
        pathname?.includes("/mis-compras") ||
        pathname?.startsWith("/cursos") ||
        pathname?.startsWith("/suscripcion") ||
        pathname?.startsWith("/admin/cursos") ||
        pathname?.startsWith("/admin/blog") ||
        pathname?.startsWith("/admin/usuarios") ||
        pathname?.startsWith("/admin/ebooks") ||
        pathname?.startsWith("/dashboard");

    const isAuthPage = pathname === "/login" ||
        pathname === "/registro" ||
        pathname?.startsWith("/auth");

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
