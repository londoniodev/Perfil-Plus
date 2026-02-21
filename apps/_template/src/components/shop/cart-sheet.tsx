"use client"

import { useState, useEffect } from "react"
import { CartSheet as SharedCartSheet, Button } from "@alvarosky/ui"
import { useCart } from "@/store/use-cart"

export function CartSheet() {
    const [isMounted, setIsMounted] = useState(false)
    const [isCheckoutProcessing, setIsCheckoutProcessing] = useState(false)
    const cart = useCart()

    // Evitar error de hidratación (localStorage vs Server)
    useEffect(() => {
        setIsMounted(true)
    }, [])

    const handleCheckout = async () => {
        setIsCheckoutProcessing(true)

        try {
            // Importar la Server Action dinámicamente
            const { placeOrder } = await import("@/actions/checkout")

            // Preparar datos del carrito
            const cartItems = cart.items.map(item => ({
                variantId: item.variantId,
                quantity: item.quantity
            }))

            // Ejecutar Server Action
            const result = await placeOrder(cartItems)

            if (result.success && result.paymentUrl) {
                // Redirigir a Mercado Pago
                window.location.href = result.paymentUrl
            } else {
                // Mostrar error
                alert(result.error || "Error al procesar la orden")
                setIsCheckoutProcessing(false)
            }
        } catch (error) {
            console.error("Error en checkout:", error)
            alert("Error al conectar con el servidor")
            setIsCheckoutProcessing(false)
        }
    }

    if (!isMounted) {
        return (
            <Button variant="ghost" size="icon" className="relative" disabled>
                <div className="h-5 w-5 bg-muted rounded-full animate-pulse" />
            </Button>
        )
    }

    return (
        <SharedCartSheet
            items={cart.items.map(item => ({
                variantId: item.variantId,
                title: item.title,
                subtitle: item.subtitle,
                price: item.price,
                quantity: item.quantity,
                imageSrc: item.imageSrc
            }))}
            totalItems={cart.totalItems()}
            totalPrice={cart.totalPrice()}
            onRemoveItem={cart.removeItem}
            onCheckout={handleCheckout}
            isCheckoutProcessing={isCheckoutProcessing}
        />
    )
}
