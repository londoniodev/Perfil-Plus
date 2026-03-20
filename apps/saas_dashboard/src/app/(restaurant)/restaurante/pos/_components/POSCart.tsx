
"use client"

import { Button, ScrollArea, Separator, Badge } from "@alvarosky/ui"
import { ShoppingCart, Plus, Minus, ChefHat } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

export interface CartItem {
    variantId: string
    productId: string
    name: string
    price: number
    quantity: number
    modifiers: {
        modifierId: string
        name: string
        priceAdjustment: number
        quantity: number
    }[]
}

interface POSCartProps {
    cart: CartItem[]
    tableId: string
    tableName?: string // Add tableName prop
    onUpdateQuantity: (variantId: string, delta: number) => void
    onClearCart: () => void
    onSendOrder: () => void
    loading: boolean
}

export function POSCart({ cart, tableId, tableName, onUpdateQuantity, onClearCart, onSendOrder, loading }: POSCartProps) {
    const total = cart.reduce((sum, item) => {
        const mods = item.modifiers.reduce((mSum, m) => mSum + (m.priceAdjustment * m.quantity), 0)
        return sum + ((item.price + mods) * item.quantity)
    }, 0)

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-border/40 bg-muted/20">
                <h2 className="font-semibold flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    Pedido (Mesa {tableName || tableId})
                </h2>
            </div>

            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                    {cart.length === 0 ? (
                        <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground text-sm opacity-50">
                            <ShoppingCart className="h-8 w-8 mb-2" />
                            <p>Lista vacía</p>
                        </div>
                    ) : (
                        cart.map((item) => (
                            <div key={item.variantId} className="flex gap-2 items-start">
                                <div className="flex-1 text-sm bg-muted/30 p-2 rounded-lg h-auto min-h-[3rem] flex flex-col justify-center">
                                    <div className="flex justify-between font-medium items-start gap-2">
                                        <span className="whitespace-normal break-words leading-tight">{item.name}</span>
                                        <span className="whitespace-nowrap font-mono">{formatCurrency(item.price * item.quantity)}</span>
                                    </div>
                                    {item.modifiers.length > 0 && (
                                        <div className="text-[10px] text-muted-foreground mt-1 bg-muted/50 px-1.5 py-0.5 rounded-sm">
                                            {item.modifiers.map(m => m.name).join(', ')}
                                        </div>
                                    )}
                                    {item.quantity > 1 && (
                                        <div className="text-xs text-muted-foreground mt-1">
                                            {item.quantity} x {formatCurrency(item.price)}
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col gap-1 items-center justify-center">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={() => onUpdateQuantity(item.variantId, 1)}
                                    >
                                        <Plus className="h-3 w-3" />
                                    </Button>
                                    <span className="text-xs font-mono">{item.quantity}</span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={() => onUpdateQuantity(item.variantId, -1)}
                                    >
                                        <Minus className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </ScrollArea>

            <div className="p-4 border-t border-border/40 bg-muted/20 space-y-4 mt-auto">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Opciones</span>
                    <Button variant="ghost" size="sm" className="h-auto py-0 text-xs text-red-500" onClick={onClearCart}>
                        Vaciar
                    </Button>
                </div>

                <Separator />

                <div className="flex justify-between items-end">
                    <span className="font-semibold">Total</span>
                    <span className="text-xl font-bold">{formatCurrency(total)}</span>
                </div>

                <Button className="w-full" size="lg" onClick={onSendOrder} disabled={loading || cart.length === 0}>
                    <ChefHat className="mr-2 h-5 w-5" />
                    {loading ? "Enviando..." : "Enviar a Cocina"}
                </Button>
            </div>
        </div>
    )
}
