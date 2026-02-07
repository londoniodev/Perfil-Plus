"use client"

import { ShoppingCart, Trash2 } from "lucide-react"
import { Button } from "../../button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../../sheet"
import { PriceDisplay } from "../../price-display"
import { AdaptiveImage } from "../../adaptive-image"

// ============================================
// Types
// ============================================

export interface CartItem {
    variantId: string
    title: string
    subtitle?: string
    price: number
    quantity: number
    imageSrc: string
}

export interface CartSheetProps {
    /** Cart items */
    items: CartItem[]
    /** Total items count */
    totalItems: number
    /** Total price */
    totalPrice: number
    /** Remove item callback */
    onRemoveItem: (variantId: string) => void
    /** Checkout callback - should handle redirect */
    onCheckout: () => Promise<void>
    /** Whether checkout is processing */
    isCheckoutProcessing?: boolean
}

// ============================================
// CartSheet Component
// ============================================

export function CartSheet({
    items,
    totalItems,
    totalPrice,
    onRemoveItem,
    onCheckout,
    isCheckoutProcessing = false
}: CartSheetProps) {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                    <ShoppingCart className="h-5 w-5" />
                    {items.length > 0 && (
                        <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full">
                            {totalItems}
                        </span>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent className="flex flex-col w-full sm:max-w-md">
                <SheetHeader>
                    <SheetTitle>Tu Carrito ({totalItems})</SheetTitle>
                </SheetHeader>

                {/* Lista de Items */}
                <div className="flex-1 overflow-y-auto py-4 space-y-4">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-2">
                            <ShoppingCart className="h-12 w-12 opacity-20" />
                            <p>Tu carrito está vacío.</p>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={item.variantId} className="flex gap-4 py-2 border-b last:border-0">
                                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md border">
                                    <AdaptiveImage src={item.imageSrc} aspectRatio="square" alt={item.title} />
                                </div>
                                <div className="flex flex-col flex-1 justify-between">
                                    <div className="grid gap-1">
                                        <h3 className="font-medium text-sm line-clamp-1">{item.title}</h3>
                                        {item.subtitle && (
                                            <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <PriceDisplay price={item.price} size="sm" />
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-muted-foreground">x{item.quantity}</span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-destructive"
                                                onClick={() => onRemoveItem(item.variantId)}
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
                {items.length > 0 && (
                    <div className="pt-4 border-t space-y-4">
                        <div className="flex items-center justify-between font-bold text-lg">
                            <span>Total</span>
                            <PriceDisplay price={totalPrice} size="default" />
                        </div>
                        <Button
                            className="w-full"
                            size="lg"
                            onClick={onCheckout}
                            disabled={isCheckoutProcessing}
                        >
                            {isCheckoutProcessing ? "Procesando..." : "Proceder al Pago"}
                        </Button>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    )
}
