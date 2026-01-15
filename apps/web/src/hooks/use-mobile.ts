"use client";

import { useState, useEffect } from "react";

/**
 * Hook para detectar si el viewport es móvil (max-width: 768px).
 * Útil para comportamiento responsivo del Sidebar y otros componentes.
 */
export function useMobile(breakpoint: number = 768): boolean {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Evitar SSR issues
        const checkMobile = () => {
            setIsMobile(window.innerWidth < breakpoint);
        };

        // Check inicial
        checkMobile();

        // Listener para resize
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, [breakpoint]);

    return isMobile;
}
