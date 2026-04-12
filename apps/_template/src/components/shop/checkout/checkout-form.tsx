"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useTenant } from "@/app/providers"
import { useCart } from "@/store/use-cart"
import { EcommerceCheckout } from "./ecommerce-checkout"
import { QuickCommerceCheckout } from "./quick-commerce-checkout"
import { useToast } from "@alvarosky/ui"
import { Loader2 } from "lucide-react"
import { useRef } from "react"

export function CheckoutForm() {
    const { tenantId, features } = useTenant()
    const { setCart, items, totalPrice } = useCart()
    const { toast } = useToast()
    const router = useRouter()
    const searchParams = useSearchParams()
    
    const waParam = searchParams.get("wa")
    const [waData, setWaData] = useState<{ customerData?: any; items?: any[] } | undefined>(undefined)
    const isRestaurant = features?.includes("RESTAURANT")
    const isQuickCommerce = !!waParam || isRestaurant || !!waData
    const [isLoadingWaCart, setIsLoadingWaCart] = useState(!!waParam)
    const [cartLoaded, setCartLoaded] = useState(false)

    // ━━━ FIX CARRITO FANTASMA ━━━
    // Si hay parámetro `wa` en la URL, el localStorage es IRRELEVANTE.
    // Limpiar el carrito INMEDIATAMENTE (sincrónicamente) antes de cualquier fetch.
    useEffect(() => {
        if (waParam) {
            setCart([]) // Elimina items viejos del localStorage/Zustand al instante
        }
    }, [waParam, setCart])

    // ━━━ TIKTOK PIXEL: INITIATE CHECKOUT ━━━
    const hasTrackedCheckout = useRef(false)
    useEffect(() => {
        if (!hasTrackedCheckout.current && cartLoaded && items.length > 0) {
            if (typeof window !== 'undefined' && (window as any).ttq) {
                try {
                    ;(window as any).ttq.track('InitiateCheckout', {
                        contents: items.map(i => ({
                            content_id: i.productId,
                            content_name: i.title,
                            quantity: i.quantity,
                            price: i.price
                        })),
                        value: totalPrice(),
                        currency: 'COP'
                    })
                } catch(e) {}
            }
            hasTrackedCheckout.current = true
        } else if (!hasTrackedCheckout.current && !waParam && items.length > 0) {
            // Caso E-commerce normal (cartLoaded no importa tanto)
            if (typeof window !== 'undefined' && (window as any).ttq) {
                try {
                    ;(window as any).ttq.track('InitiateCheckout', {
                        contents: items.map(i => ({
                            content_id: i.productId,
                            content_name: i.title,
                            quantity: i.quantity,
                            price: i.price
                        })),
                        value: totalPrice(),
                        currency: 'COP'
                    })
                } catch(e) {}
            }
            hasTrackedCheckout.current = true
        }
    }, [cartLoaded, items, waParam, totalPrice])

    // Fetch del carrito de WhatsApp desde el backend
    useEffect(() => {
        if (waParam && !cartLoaded && !waData) {
            const fetchWaCart = async () => {
                try {
                    const _apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api').replace(/\/+$/, "");
                    const API_URL = _apiUrl.endsWith('/api') ? _apiUrl : `${_apiUrl}/api`;
                    const res = await fetch(`${API_URL}/wa-cart/${waParam}`, {
                        headers: {
                            'x-tenant-id': tenantId
                        },
                        cache: 'no-store', // CRÍTICO: Evita respuestas cacheadas por Next.js/navegador
                    })
                    
                    if (!res.ok) {
                        throw new Error(res.status === 404 ? 'enlace-expirado' : 'error-servidor')
                    }
                    
                    const data = await res.json()
                    if (data.items && Array.isArray(data.items)) {
                        setCart(data.items) // Sobrescribe con los items FRESCOS del backend
                        setWaData(data)
                        setCartLoaded(true)
                        // Limpiar URL sin perder el estado de waData
                        window.history.replaceState({}, '', window.location.pathname);
                    }
                } catch (e: any) {
                    console.error("Error cargando carrito de IA:", e)
                    if (e.message === 'enlace-expirado') {
                        toast.error("El enlace de pago es inválido o ya expiró (dura 24 horas).")
                    } else {
                        toast.error("Hubo un problema cargando tu carrito.")
                    }
                    setCartLoaded(true)
                } finally {
                    setIsLoadingWaCart(false)
                }
            }
            fetchWaCart()
        }
    }, [waParam, cartLoaded, waData, setCart, toast, tenantId])

    if (isLoadingWaCart) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">Optimizando tu experiencia de pago...</p>
            </div>
        )
    }

    if (isQuickCommerce) {
        return <QuickCommerceCheckout waData={waData} isLoading={isLoadingWaCart} />
    }

    return <EcommerceCheckout />
}
