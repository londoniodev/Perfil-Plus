"use client";

import { usePathname } from "next/navigation";
import { Header } from "./Header";

export function NavigationWrapper({ children, footer }: { children: React.ReactNode, footer: React.ReactNode }) {
    const pathname = usePathname();

    // Rutas que usan el Layout del Dashboard (Sidebar/BottomNav) y NO deben tener Header/Footer
    const isDashboard = pathname?.startsWith("/perfil") ||
        pathname?.includes("/mis-compras") ||
        // También detectar si estamos dentro de (dashboard) por url si usáramos prefijo, pero no usamos.
        // /admin/login NO es dashboard (tiene header publico o login layout?)
        // Login tiene layout propio? No, usa root.
        // Admin Login debería tener Header?
        // Actualmente Admin Login tiene Header.
        pathname?.startsWith("/dashboard");

    if (isDashboard) {
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
