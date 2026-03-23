"use client"

import { useState, useMemo } from "react"
import { useTenant } from "@/app/providers";
import { Dialog, DialogContent, DialogHeader, DialogTitle, Button, Input, ScrollArea, Tabs, TabsList, TabsTrigger, TabsContent, Badge, Separator } from "@alvarosky/ui"
import { Table } from "@/actions/admin/tables"
import { useMenu } from "@alvarosky/restaurant-sdk"
import { useOrder } from "@alvarosky/restaurant-sdk"
import { } from "@/lib/config"
import Image from "next/image"
import { Search, Plus, Minus, Trash2, ShoppingCart, ChefHat, ArrowLeft, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { PublicProduct, PublicCategory, SelectedModifier } from "@alvarosky/restaurant-sdk"
import { formatCurrency } from "@/lib/utils"

interface CreateOrderModalProps {
    isOpen: boolean
    onClose: () => void
    tables: Table[]
    onOrderCreated: () => void
}

interface LocalCartItem {
    variantId: string
    productId: string
    productName: string
    price: number
    quantity: number
    modifiers: SelectedModifier[] // Use exact modifier type
}

export function CreateOrderModal({ isOpen, onClose, tables, onOrderCreated }: CreateOrderModalProps) {
    const { tenantId } = useTenant();

    const [step, setStep] = useState<1 | 2>(1)
    const [selectedTable, setSelectedTable] = useState<Table | null>(null)
    const [cart, setCart] = useState<LocalCartItem[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [activeCategory, setActiveCategory] = useState("ALL")

    const { categories, products, isLoading } = useMenu()
    const { createOrder, isSubmitting } = useOrder()

    // Filter products using safe casting to match SDK definitions
    const filteredProducts = useMemo(() => {
        if (!products) return []
        return products.filter(p => {
            const product = p as PublicProduct
            const matchesCategory = activeCategory === "ALL" || product.categoryId === activeCategory || product.categories?.some((c: PublicCategory) => c.id === activeCategory)
            const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
            const isAvailable = (product as any).isAvailable !== false && (product.variants?.some(v => (v as any).stock === -1 || (v as any).stock > 0) ?? true)
            return matchesCategory && matchesSearch && isAvailable
        })
    }, [products, activeCategory, searchQuery])

    // Cart logic
    const addToCart = (product: PublicProduct) => {
        // Use first variant for simplicity in this waiter view v1
        // In v2 we should show variant selector
        const variant = product.variants?.[0]
        if (!variant) return

        setCart(prev => {
            const existing = prev.find(item => item.variantId === variant.id)
            if (existing) {
                return prev.map(item => item.variantId === variant.id ? { ...item, quantity: item.quantity + 1 } : item)
            }
            return [...prev, {
                variantId: variant.id,
                productId: product.id,
                productName: product.name + ((product.variants && product.variants.length > 1) ? ` (${variant.name})` : ""),
                price: Number(variant.price),
                quantity: 1,
                modifiers: []
            }]
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

    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)

    const handleCreateOrder = async () => {
        if (!selectedTable || cart.length === 0) return

        try {
            // Transform local cart to SDK CartItem format
            // SDK expects CartItem[] which has specific shape
            const sdkCart = cart.map(item => ({
                variantId: item.variantId,
                productId: item.productId,
                quantity: item.quantity,
                title: item.productName,
                name: item.productName, // added name property
                price: item.price,
                imageSrc: "",
                productType: "PHYSICAL" as const,
                modifiers: []
            }))

            const result = await createOrder({
                cart: sdkCart,
                total: cartTotal,
                customer: {
                    name: `Mesa ${selectedTable.label}`, // Auto-name
                    phone: "0000000000",
                    tableNumber: selectedTable.id // Pass UUID
                }
            })

            if (result.success) {
                toast.success(`Orden creada para Mesa ${selectedTable.label}`)
                onOrderCreated()
                handleClose()
            } else {
                toast.error(result.error || "Error al crear orden")
            }
        } catch (error) {
            console.error(error)
            toast.error("Error inesperado")
        }
    }

    const handleClose = () => {
        setStep(1)
        setSelectedTable(null)
        setCart([])
        setSearchQuery("")
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
                <DialogHeader className="p-4 border-b bg-background z-10">
                    <DialogTitle className="flex items-center gap-2">
                        {step === 2 && (
                            <Button variant="ghost" size="icon" onClick={() => setStep(1)} className="h-8 w-8 -ml-2 mr-1">
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                        )}
                        {step === 1 ? "Seleccionar Mesa" : `Nueva Orden - Mesa ${selectedTable?.label}`}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-hidden relative">
                    {/* STEP 1: TABLE SELECTION */}
                    {step === 1 && (
                        <ScrollArea className="h-full bg-muted/30 p-6">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {tables.map(table => (
                                    <button
                                        key={table.id}
                                        onClick={() => { setSelectedTable(table); setStep(2) }}
                                        className={`
                                            flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all hover:scale-105
                                            bg-card hover:border-primary/50 text-card-foreground shadow-sm
                                        `}
                                    >
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 text-primary font-bold text-xl">
                                            {table.label}
                                        </div>
                                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                                            <ChefHat className="w-3 h-3" />
                                            {table.capacity}p
                                        </div>
                                    </button>
                                ))}
                                {tables.length === 0 && (
                                    <div className="col-span-full py-12 text-center text-muted-foreground">
                                        No hay mesas configuradas.
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    )}

                    {/* STEP 2: PRODUCT SELECTION & CART */}
                    {step === 2 && (
                        <div className="flex h-full">
                            {/* LEFT: MENU */}
                            <div className="flex-1 flex flex-col border-r h-full overflow-hidden">
                                {/* Search & Categories */}
                                <div className="p-4 space-y-4 border-b bg-background">
                                    <div className="relative">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Buscar productos..."
                                            className="pl-9"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                    <ScrollArea className="w-full whitespace-nowrap pb-2">
                                        <div className="flex gap-2">
                                            <Button
                                                variant={activeCategory === "ALL" ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setActiveCategory("ALL")}
                                                className="rounded-full"
                                            >
                                                Todos
                                            </Button>
                                            {categories?.map((cat: PublicCategory) => (
                                                <Button
                                                    key={cat.id}
                                                    variant={activeCategory === cat.id ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => setActiveCategory(cat.id)}
                                                    className="rounded-full"
                                                >
                                                    {cat.name}
                                                </Button>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </div>

                                {/* Product Grid */}
                                <ScrollArea className="flex-1 p-4 bg-muted/10">
                                    {isLoading ? (
                                        <div className="flex justify-center py-12"><Loader2 className="animate-spin" /></div>
                                    ) : (
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3">
                                            {filteredProducts.map((product: PublicProduct) => (
                                                <button
                                                    key={product.id}
                                                    onClick={() => addToCart(product)}
                                                    className="text-left group bg-card hover:bg-accent/50 border rounded-lg overflow-hidden transition-colors flex flex-col h-full"
                                                >
                                                    <div className="aspect-square bg-muted relative overflow-hidden">
                                                        <Image
                                                            src={product.images?.[0] || 'https://via.placeholder.com/150'}
                                                            alt={product.name}
                                                            fill
                                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                        />
                                                    </div>
                                                    <div className="p-3 flex-1 flex flex-col gap-1">
                                                        <span className="font-medium text-sm line-clamp-2 leading-tight">{product.name}</span>
                                                        <span className="text-primary font-bold text-sm mt-auto">
                                                            {formatCurrency(Number(product.variants?.[0]?.price ?? product.basePrice))}
                                                        </span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </ScrollArea>
                            </div>

                            {/* RIGHT: CART */}
                            <div className="w-[320px] lg:w-[380px] flex flex-col bg-card h-full border-l shadow-xl z-20">
                                <div className="p-4 border-b flex items-center justify-between">
                                    <h3 className="font-semibold flex items-center gap-2">
                                        <ShoppingCart className="w-4 h-4" />
                                        Orden Actual
                                    </h3>
                                    <Badge variant="secondary">{cart.reduce((a, b) => a + b.quantity, 0)} items</Badge>
                                </div>

                                <ScrollArea className="flex-1 p-4">
                                    <div className="space-y-4">
                                        {cart.length === 0 ? (
                                            <div className="text-center text-muted-foreground py-12 flex flex-col items-center gap-2">
                                                <ShoppingCart className="w-12 h-12 opacity-20" />
                                                <p>Carrito vacío</p>
                                                <p className="text-xs">Selecciona productos del menú</p>
                                            </div>
                                        ) : (
                                            cart.map((item) => (
                                                <div key={item.variantId} className="flex gap-3 items-start group">
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium">{item.productName}</p>
                                                        <p className="text-xs text-muted-foreground">{formatCurrency(item.price)}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2 bg-muted rounded-md p-0.5">
                                                        <button onClick={() => updateQuantity(item.variantId, -1)} className="p-1 hover:bg-background rounded disabled:opacity-50">
                                                            <Minus className="w-3 h-3" />
                                                        </button>
                                                        <span className="text-xs font-mono w-4 text-center">{item.quantity}</span>
                                                        <button onClick={() => updateQuantity(item.variantId, 1)} className="p-1 hover:bg-background rounded">
                                                            <Plus className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </ScrollArea>

                                <div className="p-4 border-t bg-muted/20 space-y-4">
                                    <div className="flex justify-between items-center text-lg font-bold">
                                        <span>Total</span>
                                        <span>{formatCurrency(cartTotal)}</span>
                                    </div>
                                    <Button
                                        className="w-full h-12 text-lg"
                                        disabled={cart.length === 0 || isSubmitting}
                                        onClick={handleCreateOrder}
                                    >
                                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <ChefHat className="w-5 h-5 mr-2" />}
                                        Enviar a Cocina
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
