"use client"

import { useState, useEffect } from "react"
import { CartSheet as SharedCartSheet, Button } from "@alvarosky/ui"
import { useCart } from "@/store/use-cart"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"

export function CartSheet() {
    const [isMounted, setIsMounted] = useState(false)
    const [isCheckoutProcessing, setIsCheckoutProcessing] = useState(false)
    const cart = useCart()
    const router = useRouter()
    const { user } = useAuth()

    // Evitar error de hidratación (localStorage vs Server)
    useEffect(() => {
        setIsMounted(true)
    }, [])

    const handleCheckout = async () => {
        // Redirigir siempre a la página de checkout (donde se capturan datos de invitado o login)
        router.push("/checkout")
    }

    if (!isMounted) {
        return (
            <Button variant="ghost" size="icon" className="relative" disabled aria-label="Cargando carrito">
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
