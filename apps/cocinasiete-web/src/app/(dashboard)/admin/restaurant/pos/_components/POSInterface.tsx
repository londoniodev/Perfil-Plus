"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { POSProduct, createPOSOrder } from "@/actions/pos"
import { Button, Card, Input, ScrollArea, useToast, Sheet, SheetContent, SheetTrigger, SheetTitle, Badge } from "@alvarosky/ui"
import { Search, ShoppingCart, ArrowLeft, Loader2, Plus } from "lucide-react"
import { POSCart, type CartItem } from "./POSCart"
import { ProductSelectionDialog } from "./ProductSelectionDialog"
import { formatCurrency } from "@/lib/utils"

interface POSInterfaceProps {
    products: POSProduct[]
    tableId: string
    tableName?: string
}

export function POSInterface({ products, tableId, tableName }: POSInterfaceProps) {
    const router = useRouter()
    const { showToast, success, error } = useToast()
    const [cart, setCart] = useState<CartItem[]>([])
    const [search, setSearch] = useState("")
    const [loading, setLoading] = useState(false)
    const [isCartOpen, setIsCartOpen] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<POSProduct | null>(null)

    // Filter products
    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
    )

    const onProductClick = (product: POSProduct) => {
        setSelectedProduct(product)
    }

    const handleAddToCartFromDialog = (item: any) => {
        // Haptic feedback if available
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(50)
        }

        setCart(prev => {
            const existing = prev.find(i => i.variantId === item.variantId)
            if (existing) {
                return prev.map(i => i.variantId === item.variantId
                    ? { ...i, quantity: i.quantity + item.quantity }
                    : i
                )
            }
            return [...prev, item]
        })

        showToast({
            type: "success",
            title: "Agregado", // Simple title
            message: `${item.name} x${item.quantity} agregado`,
            duration: 1500
        })
    }

    const updateQuantity = (variantId: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.variantId === variantId) {
                const newQty = Math.max(0, item.quantity + delta)
                return { ...item, quantity: newQty }
            }
            return item
        }).filter(item => item.quantity > 0))
    }

    const clearCart = () => setCart([])

    const handleSendOrder = async () => {
        if (cart.length === 0) return
        setLoading(true)

        try {
            const res = await createPOSOrder({
                tableId,
                items: cart.map(item => ({
                    variantId: item.variantId,
                    quantity: item.quantity,
                    modifiers: item.modifiers
                }))
            })

            if (res.success) {
                success(`Pedido #${res.orderId?.slice(-4)} creado para ${tableName || "Mesa " + tableId}`, "Orden enviada")
                setCart([])
                setIsCartOpen(false)
                router.push("/admin/restaurant/pos")
            } else {
                throw new Error(res.error)
            }
        } catch (err: any) {
            console.error(err)
            error(err.message || "No se pudo enviar la orden", "Error")
        } finally {
            setLoading(false)
        }
    }

    const total = cart.reduce((sum, item) => {
        const mods = item.modifiers.reduce((mSum, m) => mSum + (m.priceAdjustment * m.quantity), 0)
        return sum + ((item.price + mods) * item.quantity)
    }, 0)

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-8rem)] lg:h-[calc(100vh-2rem)] gap-4 pb-20 lg:pb-0 relative">
            {/* LEFT: Menu Grid */}
            <div className="flex-1 flex flex-col space-y-4 overflow-hidden">
                {/* Header / Search */}
                <div className="flex gap-4">
                    <Button variant="outline" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="relative flex-1">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar productos..."
                            className="pl-8"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Grid */}
                <ScrollArea className="flex-1 rounded-md border p-4 bg-muted/10">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
                        {filteredProducts.map(product => (
                            <Card
                                key={product.id}
                                className="cursor-pointer hover:bg-muted/50 transition-colors flex flex-col overflow-hidden group border-muted"
                                onClick={() => onProductClick(product)}
                            >
                                <div className="aspect-square bg-muted relative overflow-hidden">
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        fill
                                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                        className="object-cover transition-transform group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Plus className="text-white h-8 w-8 drop-shadow-md" />
                                    </div>
                                </div>
                                <div className="p-3">
                                    <h3 className="font-semibold text-sm line-clamp-2 leading-tight min-h-[2.5em]">
                                        {product.name}
                                    </h3>
                                    <p className="text-primary font-bold text-sm mt-2">
                                        {formatCurrency(product.variants[0]?.price || 0)}
                                    </p>
                                </div>
                            </Card>
                        ))}
                    </div>
                </ScrollArea>
            </div>

            {/* RIGHT: Cart (Desktop Sidebar) */}
            <Card className="hidden lg:flex w-[350px] flex-col h-full shadow-lg border-l overflow-hidden">
                <POSCart
                    cart={cart}
                    tableId={tableId}
                    tableName={tableName}
                    loading={loading}
                    onUpdateQuantity={updateQuantity}
                    onClearCart={clearCart}
                    onSendOrder={handleSendOrder}
                />
            </Card>

            {/* MOBILE BOTTOM BAR */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-background border-t z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
                    <SheetTrigger asChild>
                        <Button className="w-full h-12 text-lg shadow-lg" size="lg">
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-2">
                                    <ShoppingCart className="h-5 w-5" />
                                    <Badge variant="secondary" className="px-1.5 min-w-[1.5rem] h-6 flex items-center justify-center bg-primary-foreground/20 text-primary-foreground">
                                        {totalItems}
                                    </Badge>
                                </div>
                                <span className="font-bold">Ver Pedido</span>
                                <span className="font-mono bg-black/20 px-2 py-1 rounded text-sm">
                                    {formatCurrency(total)}
                                </span>
                            </div>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="h-[90vh] p-0 rounded-t-xl bg-background outline-none">
                        <SheetTitle className="sr-only">Carrito de Compras</SheetTitle>
                        <POSCart
                            cart={cart}
                            tableId={tableId}
                            tableName={tableName}
                            loading={loading}
                            onUpdateQuantity={updateQuantity}
                            onClearCart={clearCart}
                            onSendOrder={handleSendOrder}
                        />
                    </SheetContent>
                </Sheet>
            </div>

            <ProductSelectionDialog
                open={!!selectedProduct}
                onOpenChange={(open) => !open && setSelectedProduct(null)}
                product={selectedProduct}
                onAddToCart={handleAddToCartFromDialog}
            />
        </div>
    )
}
