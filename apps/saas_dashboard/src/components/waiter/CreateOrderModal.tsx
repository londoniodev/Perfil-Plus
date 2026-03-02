"use client"

import { useState, useMemo, useCallback } from "react"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
    Button, Input, ScrollArea, Badge,
} from "@alvarosky/ui"
import { Table } from "@/actions/admin/tables"
import { useMenu, useOrder } from "@alvarosky/restaurant-sdk"
import {
    Search, Plus, Minus, ShoppingCart, ChefHat,
    ArrowLeft, Loader2, X, Check,
} from "lucide-react"
import { toast } from "sonner"
import { PublicProduct, PublicCategory, SelectedModifier, ModifierGroup } from "@alvarosky/restaurant-sdk"
import { formatCurrency } from "@/lib/utils"

// ─── Types ───
interface CreateOrderModalProps {
    isOpen: boolean
    onClose: () => void
    tables: Table[]
    onOrderCreated: () => void
    tenantId: string
}

interface LocalCartItem {
    variantId: string
    productId: string
    productName: string
    variantName?: string
    price: number
    quantity: number
    modifiers: SelectedModifier[]
}

type ModalStep = "tables" | "menu" | "modifiers"

// ─── Module-scope sub-components (React Doctor compliant) ───

function TableGrid({ tables, onSelect }: { tables: Table[]; onSelect: (t: Table) => void }) {
    return (
        <ScrollArea className="h-full p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {tables.map(table => (
                    <button
                        key={table.id}
                        onClick={() => onSelect(table)}
                        className="flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all hover:scale-105 bg-card hover:border-primary/50 text-card-foreground shadow-sm"
                    >
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 text-primary font-bold text-xl">
                            {table.label}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <ChefHat className="w-3 h-3" aria-hidden="true" />
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
    )
}

function ProductRow({ product, onSelect }: { product: PublicProduct; onSelect: (p: PublicProduct) => void }) {
    const price = Number(product.variants?.[0]?.price ?? product.basePrice)
    const hasModifiers = product.modifierGroups && product.modifierGroups.length > 0

    return (
        <button
            onClick={() => onSelect(product)}
            className="w-full flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors text-left group"
        >
            <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{product.name}</p>
                {hasModifiers && (
                    <p className="text-xs text-muted-foreground mt-0.5">Con opciones</p>
                )}
            </div>
            <div className="flex items-center gap-2 ml-3 shrink-0">
                <span className="text-primary font-bold text-sm">{formatCurrency(price)}</span>
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Plus className="w-4 h-4" aria-hidden="true" />
                </div>
            </div>
        </button>
    )
}

function ModifierPanel({
    product,
    selections,
    quantity,
    onToggleModifier,
    onQuantityChange,
    onConfirm,
    onBack,
}: {
    product: PublicProduct
    selections: Record<string, Set<string>>
    quantity: number
    onToggleModifier: (groupId: string, modifierId: string, maxSelect: number) => void
    onQuantityChange: (delta: number) => void
    onConfirm: () => void
    onBack: () => void
}) {
    const variant = product.variants?.[0]
    const basePrice = Number(variant?.price ?? product.basePrice)

    // Calculate modifier price
    const modifierPrice = useMemo(() => {
        let total = 0
        product.modifierGroups?.forEach(group => {
            const selected = selections[group.id]
            if (!selected) return
            group.modifiers.forEach(mod => {
                if (selected.has(mod.id)) {
                    total += Number(mod.price)
                }
            })
        })
        return total
    }, [product.modifierGroups, selections])

    const unitTotal = basePrice + modifierPrice
    const hasGroups = product.modifierGroups && product.modifierGroups.length > 0

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b bg-background">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8 shrink-0" aria-label="Volver">
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg truncate">{product.name}</h3>
                        <p className="text-sm text-primary font-semibold">{formatCurrency(basePrice)}</p>
                    </div>
                </div>
            </div>

            {/* Modifier Groups */}
            <ScrollArea className="flex-1 p-4">
                {hasGroups ? (
                    <div className="space-y-6">
                        {product.modifierGroups!.map((group: ModifierGroup) => {
                            const selected = selections[group.id] || new Set<string>()
                            const isRadio = group.maxSelections === 1
                            const isRequired = group.minSelections > 0

                            return (
                                <section key={group.id} className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-semibold text-sm">{group.name}</h4>
                                        <div className="flex items-center gap-2">
                                            {isRequired && (
                                                <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                                                    Requerido
                                                </Badge>
                                            )}
                                            <span className="text-xs text-muted-foreground">
                                                {isRadio ? "Elige 1" : `Máx ${group.maxSelections}`}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        {group.modifiers.map(mod => {
                                            const isSelected = selected.has(mod.id)
                                            return (
                                                <button
                                                    key={mod.id}
                                                    onClick={() => onToggleModifier(group.id, mod.id, group.maxSelections)}
                                                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all text-left ${isSelected
                                                        ? "border-primary bg-primary/5"
                                                        : "border-transparent bg-muted/30 hover:bg-muted/50"
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-5 h-5 rounded-${isRadio ? "full" : "md"} border-2 flex items-center justify-center transition-colors ${isSelected
                                                            ? "bg-primary border-primary"
                                                            : "border-muted-foreground/30"
                                                            }`}>
                                                            {isSelected && <Check className="w-3 h-3 text-primary-foreground" aria-hidden="true" />}
                                                        </div>
                                                        <span className="text-sm font-medium">{mod.name}</span>
                                                    </div>
                                                    {Number(mod.price) > 0 && (
                                                        <span className="text-xs text-muted-foreground font-mono">+{formatCurrency(mod.price)}</span>
                                                    )}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </section>
                            )
                        })}
                    </div>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                        <p className="text-sm">Este producto no tiene opciones adicionales.</p>
                    </div>
                )}
            </ScrollArea>

            {/* Bottom: Quantity + Confirm */}
            <div className="p-4 border-t bg-muted/10 space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Cantidad</span>
                    <div className="flex items-center gap-3 bg-muted rounded-lg p-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onQuantityChange(-1)} aria-label="Reducir cantidad">
                            <Minus className="w-4 h-4" />
                        </Button>
                        <span className="font-bold text-lg w-6 text-center font-mono">{quantity}</span>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onQuantityChange(1)} aria-label="Aumentar cantidad">
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
                <Button className="w-full h-12 text-base font-bold" onClick={onConfirm}>
                    Agregar — {formatCurrency(unitTotal * quantity)}
                </Button>
            </div>
        </div>
    )
}

function CartPanel({
    cart,
    cartTotal,
    isExpanded,
    onToggle,
    onUpdateQuantity,
    onRemoveItem,
    onSubmit,
    isSubmitting,
}: {
    cart: LocalCartItem[]
    cartTotal: number
    isExpanded: boolean
    onToggle: () => void
    onUpdateQuantity: (variantId: string, delta: number) => void
    onRemoveItem: (variantId: string) => void
    onSubmit: () => void
    isSubmitting: boolean
}) {
    const itemCount = cart.reduce((a, b) => a + b.quantity, 0)

    return (
        <div className="shrink-0 border-t bg-card">
            {/* Bottom bar (always visible) */}
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between p-3 hover:bg-accent/30 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <ShoppingCart className="w-5 h-5" aria-hidden="true" />
                        {itemCount > 0 && (
                            <Badge className="absolute -top-2 -right-2 h-4 min-w-4 px-1 text-[10px] flex items-center justify-center">
                                {itemCount}
                            </Badge>
                        )}
                    </div>
                    <span className="font-medium text-sm">
                        {itemCount === 0 ? "Carrito vacío" : `${itemCount} item${itemCount > 1 ? "s" : ""}`}
                    </span>
                </div>
                <span className="font-bold text-lg text-primary">{formatCurrency(cartTotal)}</span>
            </button>

            {/* Expandable cart content */}
            {isExpanded && (
                <div className="border-t max-h-[50vh] flex flex-col animate-in slide-in-from-bottom-2 duration-200">
                    <ScrollArea className="flex-1 p-4">
                        {cart.length === 0 ? (
                            <div className="text-center text-muted-foreground py-8 flex flex-col items-center gap-2">
                                <ShoppingCart className="w-10 h-10 opacity-20" aria-hidden="true" />
                                <p className="text-sm">Carrito vacío</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {cart.map(item => (
                                    <div key={item.variantId} className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg border">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{item.productName}</p>
                                            {item.modifiers.length > 0 && (
                                                <p className="text-xs text-muted-foreground truncate mt-0.5">
                                                    + {item.modifiers.map(m => m.modifierName).join(", ")}
                                                </p>
                                            )}
                                            <p className="text-xs text-primary font-semibold mt-0.5">{formatCurrency(item.price)} c/u</p>
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-muted rounded-md p-0.5 shrink-0">
                                            <button onClick={() => onUpdateQuantity(item.variantId, -1)} className="p-1.5 hover:bg-background rounded" aria-label="Reducir cantidad">
                                                <Minus className="w-3 h-3" />
                                            </button>
                                            <span className="text-sm font-mono w-5 text-center font-bold">{item.quantity}</span>
                                            <button onClick={() => onUpdateQuantity(item.variantId, 1)} className="p-1.5 hover:bg-background rounded" aria-label="Aumentar cantidad">
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>
                                        <button onClick={() => onRemoveItem(item.variantId)} className="p-1.5 text-destructive hover:bg-destructive/10 rounded shrink-0" aria-label="Eliminar producto">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>

                    <div className="p-3 border-t bg-muted/10">
                        <Button
                            className="w-full h-11 text-base font-bold"
                            disabled={cart.length === 0 || isSubmitting}
                            onClick={onSubmit}
                        >
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" aria-hidden="true" /> : <ChefHat className="w-5 h-5 mr-2" aria-hidden="true" />}
                            Enviar a Cocina — {formatCurrency(cartTotal)}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}

// ─── Main Component ───
export function CreateOrderModal({ isOpen, onClose, tables, onOrderCreated, tenantId }: CreateOrderModalProps) {
    const [step, setStep] = useState<ModalStep>("tables")
    const [selectedTable, setSelectedTable] = useState<Table | null>(null)
    const [cart, setCart] = useState<LocalCartItem[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [isCartExpanded, setIsCartExpanded] = useState(false)
    const [activeCategory, setActiveCategory] = useState("ALL")

    // Modifier step state
    const [selectedProduct, setSelectedProduct] = useState<PublicProduct | null>(null)
    const [modifierSelections, setModifierSelections] = useState<Record<string, Set<string>>>({})
    const [modifierQuantity, setModifierQuantity] = useState(1)

    const { categories, products, isLoading } = useMenu(tenantId)
    const { createOrder, isSubmitting } = useOrder()

    // Filter products
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

    // ─── Product selection handler ───
    const handleProductSelect = useCallback((product: PublicProduct) => {
        const hasModifiers = product.modifierGroups && product.modifierGroups.length > 0

        if (hasModifiers) {
            // Go to modifier step
            setSelectedProduct(product)
            setModifierSelections({})
            setModifierQuantity(1)
            setStep("modifiers")
        } else {
            // Direct add (no modifiers)
            const variant = product.variants?.[0]
            if (!variant) return

            setCart(prev => {
                const existing = prev.find(item => item.variantId === variant.id && item.modifiers.length === 0)
                if (existing) {
                    return prev.map(item => item.variantId === variant.id && item.modifiers.length === 0
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                    )
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
            toast.success(`${product.name} agregado`)
        }
    }, [])

    // ─── Modifier toggle ───
    const handleModifierToggle = useCallback((groupId: string, modifierId: string, maxSelect: number) => {
        setModifierSelections(prev => {
            const current = new Set(prev[groupId] || [])

            if (current.has(modifierId)) {
                current.delete(modifierId)
            } else {
                if (maxSelect === 1) {
                    // Radio behavior: replace
                    current.clear()
                    current.add(modifierId)
                } else if (current.size < maxSelect) {
                    current.add(modifierId)
                } else {
                    toast.error(`Máximo ${maxSelect} opciones`)
                    return prev
                }
            }

            return { ...prev, [groupId]: current }
        })
    }, [])

    // ─── Confirm modifier selection ───
    const handleModifierConfirm = useCallback(() => {
        if (!selectedProduct) return

        const variant = selectedProduct.variants?.[0]
        if (!variant) return

        // Validate required groups
        for (const group of (selectedProduct.modifierGroups || [])) {
            const selected = modifierSelections[group.id]
            if (group.minSelections > 0 && (!selected || selected.size < group.minSelections)) {
                toast.error(`Selecciona al menos ${group.minSelections} opción en "${group.name}"`)
                return
            }
        }

        // Build modifiers array
        const modifiers: SelectedModifier[] = []
        selectedProduct.modifierGroups?.forEach(group => {
            const selected = modifierSelections[group.id]
            if (!selected) return
            group.modifiers.forEach(mod => {
                if (selected.has(mod.id)) {
                    modifiers.push({
                        modifierId: mod.id,
                        modifierName: mod.name,
                        priceAdjustment: Number(mod.price),
                        quantity: 1,
                    })

                }
            })
        })

        // Calculate total price per unit (base + modifiers)
        const modifierTotal = modifiers.reduce((sum, m) => sum + m.priceAdjustment, 0)
        const unitPrice = Number(variant.price) + modifierTotal

        const modifierSuffix = modifiers.length > 0
            ? ` (${modifiers.map(m => m.modifierName).join(", ")})`
            : ""

        setCart(prev => [...prev, {
            variantId: variant.id + "_" + Date.now(), // Unique key for items with different modifiers
            productId: selectedProduct.id,
            productName: selectedProduct.name + modifierSuffix,
            price: unitPrice,
            quantity: modifierQuantity,
            modifiers,
        }])

        toast.success(`${selectedProduct.name} agregado`)
        setSelectedProduct(null)
        setStep("menu")
    }, [selectedProduct, modifierSelections, modifierQuantity])

    // ─── Cart helpers ───
    const updateQuantity = useCallback((variantId: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.variantId === variantId) {
                const newQty = Math.max(0, item.quantity + delta)
                return { ...item, quantity: newQty }
            }
            return item
        }).filter(item => item.quantity > 0))
    }, [])

    const removeItem = useCallback((variantId: string) => {
        setCart(prev => prev.filter(item => item.variantId !== variantId))
    }, [])

    const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0), [cart])

    // ─── Submit order ───
    const handleCreateOrder = useCallback(async () => {
        if (!selectedTable || cart.length === 0) return

        try {
            const sdkCart = cart.map(item => ({
                variantId: item.variantId.split("_")[0], // Remove unique suffix
                productId: item.productId,
                quantity: item.quantity,
                title: item.productName,
                name: item.productName,
                price: item.price,
                imageSrc: "",
                productType: "PHYSICAL" as const,
                modifiers: item.modifiers.map(m => ({
                    modifierId: m.modifierId,
                    modifierName: m.modifierName ?? "",
                    priceAdjustment: m.priceAdjustment,
                    quantity: m.quantity,
                })),
            }))

            const result = await createOrder(tenantId, {
                cart: sdkCart,
                total: cartTotal,
                customer: {
                    name: `Mesa ${selectedTable.label}`,
                    phone: "0000000000",
                    tableNumber: selectedTable.id,
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
    }, [selectedTable, cart, cartTotal, createOrder, onOrderCreated])

    const handleClose = useCallback(() => {
        setStep("tables")
        setSelectedTable(null)
        setCart([])
        setSearchQuery("")
        setActiveCategory("ALL")
        setSelectedProduct(null)
        onClose()
    }, [onClose])

    const headerTitle = step === "tables"
        ? "Seleccionar Mesa"
        : step === "modifiers" && selectedProduct
            ? selectedProduct.name
            : `Nueva Orden — ${selectedTable?.label}`

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="max-w-lg h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
                {/* Header */}
                <DialogHeader className="p-4 border-b bg-background z-10 shrink-0">
                    <DialogTitle className="flex items-center gap-2">
                        {step !== "tables" && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    if (step === "modifiers") setStep("menu")
                                    else setStep("tables")
                                }}
                                className="h-8 w-8 -ml-2 mr-1 shrink-0"
                                aria-label="Volver"
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                        )}
                        <span className="truncate">{headerTitle}</span>
                    </DialogTitle>
                </DialogHeader>

                {/* Content */}
                <div className="flex-1 overflow-hidden flex flex-col">
                    {/* STEP: TABLE SELECTION */}
                    {step === "tables" && (
                        <TableGrid tables={tables} onSelect={(t) => { setSelectedTable(t); setStep("menu") }} />
                    )}

                    {/* STEP: MENU (Products) */}
                    {step === "menu" && (
                        <>
                            {/* Search + Categories */}
                            <div className="p-3 space-y-3 border-b bg-background shrink-0">
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                                    <Input
                                        placeholder="Buscar..."
                                        className="pl-9 h-9"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        aria-label="Buscar productos"
                                    />
                                </div>
                                <ScrollArea className="w-full whitespace-nowrap">
                                    <div className="flex gap-2 pb-1">
                                        <Button
                                            variant={activeCategory === "ALL" ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setActiveCategory("ALL")}
                                            className="rounded-full text-xs h-7 px-3"
                                        >
                                            Todos
                                        </Button>
                                        {categories?.map((cat: PublicCategory) => (
                                            <Button
                                                key={cat.id}
                                                variant={activeCategory === cat.id ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setActiveCategory(cat.id)}
                                                className="rounded-full text-xs h-7 px-3"
                                            >
                                                {cat.name}
                                            </Button>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </div>

                            {/* Product List */}
                            <ScrollArea className="flex-1">
                                <div className="p-3 space-y-2">
                                    {isLoading ? (
                                        <div className="flex justify-center py-12">
                                            <Loader2 className="animate-spin text-primary" aria-hidden="true" />
                                        </div>
                                    ) : filteredProducts.length === 0 ? (
                                        <div className="text-center py-12 text-muted-foreground text-sm">
                                            No se encontraron productos.
                                        </div>
                                    ) : (
                                        filteredProducts.map((product: PublicProduct) => (
                                            <ProductRow key={product.id} product={product} onSelect={handleProductSelect} />
                                        ))
                                    )}
                                </div>
                            </ScrollArea>

                            {/* Cart Bottom Bar */}
                            <CartPanel
                                cart={cart}
                                cartTotal={cartTotal}
                                isExpanded={isCartExpanded}
                                onToggle={() => setIsCartExpanded(prev => !prev)}
                                onUpdateQuantity={updateQuantity}
                                onRemoveItem={removeItem}
                                onSubmit={handleCreateOrder}
                                isSubmitting={isSubmitting}
                            />
                        </>
                    )}

                    {/* STEP: MODIFIERS */}
                    {step === "modifiers" && selectedProduct && (
                        <ModifierPanel
                            product={selectedProduct}
                            selections={modifierSelections}
                            quantity={modifierQuantity}
                            onToggleModifier={handleModifierToggle}
                            onQuantityChange={(delta) => setModifierQuantity(prev => Math.max(1, prev + delta))}
                            onConfirm={handleModifierConfirm}
                            onBack={() => setStep("menu")}
                        />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
