"use client";

import { useCallback } from "react";

/**
 * Hook universal de Analítica para el Storefront.
 * Abstrae los diferentes píxeles (TikTok, Meta, GA) bajo una API unificada.
 */
export function useAnalytics() {
    
    /**
     * Registra un evento de 'Añadir al Carrito'
     */
    const trackAddToCart = useCallback((item: {
        id: string;
        name: string;
        price: number;
        quantity: number;
        currency?: string;
    }) => {
        // 1. TIKTOK PIXEL
        if (typeof window !== "undefined" && (window as any).ttq) {
            try {
                (window as any).ttq.track('AddToCart', {
                    contents: [{
                        content_id: item.id,
                        content_name: item.name,
                        quantity: item.quantity,
                        price: item.price
                    }],
                    value: item.price * item.quantity,
                    currency: item.currency || 'COP'
                });
            } catch (e) {
                console.error("[Analytics] TikTok AddToCart Error:", e);
            }
        }

        // 2. Aquí se podrían añadir más píxeles (Meta, Google, etc.)
        // console.log("[Analytics] Tracked AddToCart:", item.name);
    }, []);

    /**
     * Registra una vista de página manual (útil para Single Page Apps o Modales)
     */
    const trackPageView = useCallback(() => {
        if (typeof window !== "undefined" && (window as any).ttq) {
            try {
                (window as any).ttq.page();
            } catch (e) {}
        }
    }, []);

    return {
        trackAddToCart,
        trackPageView
    };
}
