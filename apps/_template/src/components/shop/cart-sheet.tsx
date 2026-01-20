"use client"

import { ShoppingCart, Trash2 } from "lucide-react"
import { useCart } from "@/store/use-cart"
import {
    Button,
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    PriceDisplay,
    AdaptiveImage
} from "@alvarosky/ui"
import { useState, useEffect } from "react"

export function CartSheet() {
    const [isMounted, setIsMounted] = useState(false)
    const cart = useCart()

    // Evitar error de hidratación (localStorage vs Server)
    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) return null

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                    <ShoppingCart className="h-5 w-5" />
                    {cart.items.length > 0 && (
                        <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full">
                            {cart.totalItems()}
                        </span>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent className="flex flex-col w-full sm:max-w-md">
                <SheetHeader>
                    <SheetTitle>Tu Carrito ({cart.totalItems()})</SheetTitle>
                </SheetHeader>

                {/* Lista de Items */}
                <div className="flex-1 overflow-y-auto py-4 space-y-4">
                    {cart.items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-2">
                            <ShoppingCart className="h-12 w-12 opacity-20" />
                            <p>Tu carrito está vacío.</p>
                        </div>
                    ) : (
                        cart.items.map((item) => (
                            <div key={item.variantId} className="flex gap-4 py-2 border-b last:border-0">
                                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md border">
                                    <AdaptiveImage src={item.imageSrc} aspectRatio="square" alt={item.title} />
                                </div>
                                <div className="flex flex-col flex-1 justify-between">
                                    <div className="grid gap-1">
                                        <h3 className="font-medium text-sm line-clamp-1">{item.title}</h3>
                                        <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <PriceDisplay price={item.price} size="sm" />
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-muted-foreground">x{item.quantity}</span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-destructive"
                                                onClick={() => cart.removeItem(item.variantId)}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer: Total y Checkout */}
                {cart.items.length > 0 && (
                    <div className="pt-4 border-t space-y-4">
                        <div className="flex items-center justify-between font-bold text-lg">
                            <span>Total</span>
                            <PriceDisplay price={cart.totalPrice()} size="default" />
                        </div>
                        <CheckoutButton />
                    </div>
                )}
            </SheetContent>
        </Sheet>
    )
}

// Componente separado para manejar el checkout
function CheckoutButton() {
    const cart = useCart()
    const [isProcessing, setIsProcessing] = useState(false)

    const handleCheckout = async () => {
        setIsProcessing(true)

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
                setIsProcessing(false)
            }
        } catch (error) {
            console.error("Error en checkout:", error)
            alert("Error al conectar con el servidor")
            setIsProcessing(false)
        }
    }

    return (
        <Button
            className="w-full"
            size="lg"
            onClick={handleCheckout}
            disabled={isProcessing}
        >
            {isProcessing ? "Procesando..." : "Proceder al Pago"}
        </Button>
    )
}

