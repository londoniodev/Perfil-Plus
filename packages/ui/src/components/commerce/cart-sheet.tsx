"use client"

import { ShoppingCart, Trash2 } from "lucide-react"
import { Button } from "../../button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../../sheet"
import { PriceDisplay } from "../../price-display"
import { AdaptiveImage } from "../../adaptive-image"
import { useState } from "react"

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
// CartSheet Component (White-Label Compatible)
// ============================================

export function CartSheet({
    items,
    totalItems,
    totalPrice,
    onRemoveItem,
    onCheckout,
    isCheckoutProcessing = false
}: CartSheetProps) {
    const [open, setOpen] = useState(false)

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button aria-label="Abrir carrito" variant="outline" size="icon" className="relative h-10 w-10 rounded-full border-border/50 bg-card/50 hover:bg-accent hover:text-accent-foreground transition duration-300">
                    <ShoppingCart className="h-5 w-5" />
                    {items.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full shadow-sm">
                            {totalItems}
                        </span>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent className="flex flex-col w-full sm:max-w-md border-l border-border bg-background/95 backdrop-blur-xl">
                <SheetHeader className="border-b border-border pb-4">
                    <SheetTitle className="text-xl font-light tracking-wide text-foreground">Tu Carrito ({totalItems})</SheetTitle>
                </SheetHeader>

                {/* Lista de Items */}
                <div className="flex-1 overflow-y-auto py-6 space-y-6">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-4">
                            <div className="p-6 rounded-full bg-muted/50 border border-border/50">
                                <ShoppingCart className="h-8 w-8 opacity-40" />
                            </div>
                            <p className="font-light tracking-wide">Tu carrito está vacío.</p>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={item.variantId} className="flex gap-4 group">
                                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-[var(--radius)] border border-border bg-muted">
                                    <AdaptiveImage src={item.imageSrc} aspectRatio="square" alt={item.title} className="opacity-90 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <div className="flex flex-col flex-1 justify-between py-1">
                                    <div className="grid gap-1.5">
                                        <h3 className="font-medium text-sm text-foreground line-clamp-2 leading-snug">{item.title}</h3>
                                        {item.subtitle && (
                                            <p className="text-xs text-muted-foreground font-light">{item.subtitle}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="text-foreground font-medium">
                                            <PriceDisplay price={item.price} size="sm" />
                                        </div>
                                        <div className="flex items-center gap-3 bg-muted/50 rounded-full pl-3 pr-1 py-1 border border-border/50">
                                            <span className="text-xs text-muted-foreground font-medium">Qty: {item.quantity}</span>
                                            <Button
                                                aria-label="Eliminar artículo"
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors"
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
                    <div className="pt-6 border-t border-border space-y-4 bg-background/50 backdrop-blur-sm -mx-6 px-6 pb-6 mt-auto">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-sm font-light uppercase tracking-wider">Total Estimado</span>
                            <div className="text-lg font-medium text-foreground">
                                <PriceDisplay price={totalPrice} size="default" />
                            </div>
                        </div>
                        <Button
                            className="w-full bg-primary text-primary-foreground hover:opacity-90 transition duration-300 font-medium tracking-wide h-12 rounded-[var(--radius)]"
                            size="lg"
                            onClick={async () => {
                                try {
                                    await onCheckout()
                                    setOpen(false)
                                } catch (e) {
                                    console.error("Checkout failed", e)
                                }
                            }}
                            disabled={isCheckoutProcessing}
                        >
                            {isCheckoutProcessing ? (
                                <span className="flex items-center gap-2">
                                    <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    Procesando...
                                </span>
                            ) : "Continuar Compra"}
                        </Button>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    )
}
