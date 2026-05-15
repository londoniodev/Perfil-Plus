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
            } catch (e) { }
        }
    }, []);

    /**
     * Registra un evento de 'Compra' (Purchase)
     */
    const trackPurchase = useCallback((data: {
        orderId: string;
        value: number;
        currency: string;
        items: any[];
    }) => {
        // 1. TIKTOK PIXEL
        if (typeof window !== "undefined" && (window as any).ttq) {
            try {
                (window as any).ttq.track('CompletePayment', {
                    value: data.value,
                    currency: data.currency,
                    contents: data.items.map(item => ({
                        content_id: item.productId || item.id,
                        content_name: item.name,
                        quantity: item.quantity,
                        price: item.price
                    }))
                }, { event_id: data.orderId });
            } catch (e) {
                console.error("[Analytics] TikTok Purchase Error:", e);
            }
        }
    }, []);

    /**
     * Despachador genérico de eventos
     */
    const trackEvent = useCallback((event: 'PURCHASE' | 'ADD_TO_CART' | 'PAGE_VIEW', payload?: any) => {
        switch (event) {
            case 'PURCHASE':
                trackPurchase(payload);
                break;
            case 'ADD_TO_CART':
                trackAddToCart(payload);
                break;
            case 'PAGE_VIEW':
                trackPageView();
                break;
        }
    }, [trackAddToCart, trackPageView, trackPurchase]);

    return {
        trackAddToCart,
        trackPageView,
        trackPurchase,
        trackEvent
    };
}
