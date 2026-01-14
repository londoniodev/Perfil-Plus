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

    if (isDashboard) {
        return <>{children}</>;
    }

    return (
        <>
            {!isAuthPage && <Header />}
            <main>{children}</main>
            {/* Footer hidden on mobile for auth pages per minimalist requirement */}
            <div className={isAuthPage ? "hide-on-mobile" : ""}>
                {footer}
            </div>

            {/* Global style to hide elements on mobile when class is present */}
            <style jsx global>{`
                @media (max-width: 768px) {
                    .hide-on-mobile {
                        display: none !important;
                    }
                }
            `}</style>
        </>
    );
}
