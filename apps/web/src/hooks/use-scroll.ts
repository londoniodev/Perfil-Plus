"use client";

import { useState, useEffect } from "react";

/**
 * Hook para detectar si el usuario ha hecho scroll.
 * Útil para añadir sombra al Navbar o cambiar estilos al hacer scroll.
 */
export function useScroll(threshold: number = 10): boolean {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > threshold);
        };

        // Check inicial
        handleScroll();

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [threshold]);

    return isScrolled;
}
