"use client"

import { useState, useMemo, useEffect } from "react"
import { POSProduct, POSModifier, POSModifierGroup } from "@/actions/pos"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    Button,
    RadioGroup,
    RadioGroupItem,
    Label,
    ScrollArea,
    Badge
} from "@alvarosky/ui"
import { formatCurrency } from "@/lib/utils"
import { Plus, Minus } from "lucide-react"
import { toast } from "sonner"

interface ProductSelectionDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    product: POSProduct | null
    onAddToCart: (item: {
        productId: string
        name: string
        variantId: string
        variantName?: string
        price: number
        quantity: number
        modifiers: {
            modifierId: string
            name: string
            priceAdjustment: number
            quantity: number
        }[]
    }) => void
}

export function ProductSelectionDialog({ open, onOpenChange, product, onAddToCart }: ProductSelectionDialogProps) {
    const [selectedVariantId, setSelectedVariantId] = useState<string>("")
    const [quantity, setQuantity] = useState(1)

    // State for selected modifiers: GroupId -> Record of ModifierId -> Quantity
    const [selectedModifiers, setSelectedModifiers] = useState<Record<string, Record<string, number>>>({})

    // Reset state when product changes or dialog opens
    useEffect(() => {
        if (open && product) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setQuantity(1)
            // Default select first variant
            const defaultVariant = product.variants.find(v => v.stock !== 0) || product.variants[0]
            setSelectedVariantId(defaultVariant?.id || "")
            setSelectedModifiers({})
        }
    }, [open, product])

    // Calculate total price of modifiers (must be called before any early return)
    const modifiersTotal = useMemo(() => {
        if (!product) return 0
        let total = 0
        product.modifierGroups.forEach(group => {
            const selectedMods = selectedModifiers[group.id] || {}
            group.modifiers.forEach((mod: POSModifier) => {
                const qty = selectedMods[mod.id]
                if (qty) {
                    total += Number(mod.price) * qty
                }
            })
        })
        return total
    }, [product, selectedModifiers])

    if (!product && open) {
        onOpenChange(false)
        return null
    }

    const variants = product?.variants || []

    // Find active variant object
    const activeVariant = variants.find(v => v.id === selectedVariantId) || variants[0]
    const basePrice = activeVariant ? Number(activeVariant.price) : 0

    const totalPrice = (basePrice + modifiersTotal) * quantity

    const handleModifierQuantityChange = (groupId: string, modifierId: string, delta: number, maxSelect: number) => {
        setSelectedModifiers(prev => {
            const groupMods = { ...(prev[groupId] || {}) }
            const currentTotal = Object.values(groupMods).reduce((sum, qty) => sum + qty, 0)
            const currentQty = groupMods[modifierId] || 0

            if (delta > 0) {
                if (maxSelect === 1) {
                    // Radio behavior
                    return {
                        ...prev,
                        [groupId]: { [modifierId]: 1 }
                    }
                }

                if (currentTotal + delta > maxSelect) {
                    toast.error(`Máximo ${maxSelect} opciones permitidas`)
                    return prev
                }
                groupMods[modifierId] = currentQty + delta
            } else {
                const newQty = Math.max(0, currentQty + delta)
                if (newQty === 0) {
                    delete groupMods[modifierId]
                } else {
                    groupMods[modifierId] = newQty
                }
            }

            return {
                ...prev,
                [groupId]: groupMods
            }
        })
    }

    const validateSelection = () => {
        if (!product) return false

        for (const group of product.modifierGroups) {
            const selectedMods = selectedModifiers[group.id] || {}
            const selectedCount = Object.values(selectedMods).reduce((sum, qty) => sum + qty, 0)
            if (selectedCount < group.minSelect) {
                toast.error(`Selecciona al menos ${group.minSelect} opción(es) en "${group.name}"`)
                return false
            }
        }
        return true
    }

    const handleAddToCart = () => {
        if (!product || !activeVariant) return

        if (!validateSelection()) return

        // Prepare modifiers list
        const appliedModifiers: {
            modifierId: string
            name: string
            priceAdjustment: number
            quantity: number
        }[] = []
        product.modifierGroups.forEach(group => {
            const selectedMods = selectedModifiers[group.id] || {}
            group.modifiers.forEach((mod: POSModifier) => {
                const qty = selectedMods[mod.id]
                if (qty) {
                    appliedModifiers.push({
                        modifierId: mod.id,
                        name: mod.name,
                        priceAdjustment: Number(mod.price),
                        quantity: qty
                    })
                }
            })
        })

        onAddToCart({
            productId: product.id,
            name: product.name,
            variantId: activeVariant.id,
            variantName: activeVariant.name !== 'Standard' && activeVariant.name !== 'Default' ? (activeVariant.name ?? undefined) : undefined,
            price: Number(activeVariant.price),
            quantity: quantity,
            modifiers: appliedModifiers
        })

        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col p-0 gap-0 bg-card">
                <DialogHeader className="p-4 pb-2 border-b border-border/40 bg-muted/10">
                    <DialogTitle className="text-xl font-bold">{product?.name}</DialogTitle>
                </DialogHeader>

                <ScrollArea className="flex-1 p-4">
                    <div className="space-y-6 pb-20">
                        {/* VARIANTS */}
                        {variants.length > 1 && (
                            <div className="space-y-3">
                                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Opciones</h4>
                                <RadioGroup value={selectedVariantId} onValueChange={setSelectedVariantId}>
                                    {variants.map((variant) => (
                                        <div key={variant.id} className={`
                                            flex items-center justify-between space-x-2 border p-3 rounded-lg transition cursor-pointer
                                            ${selectedVariantId === variant.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border/40 hover:bg-muted/50'}
                                        `} onClick={() => setSelectedVariantId(variant.id)}>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value={variant.id} id={variant.id} />
                                                <Label htmlFor={variant.id} className="font-medium cursor-pointer">
                                                    {variant.name}
                                                </Label>
                                            </div>
                                            <span className="font-mono text-sm">{formatCurrency(Number(variant.price))}</span>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </div>
                        )}

                        {/* MODIFIERS */}
                        {product?.modifierGroups && product.modifierGroups.map((group: POSModifierGroup) => {
                            const selectedMods = selectedModifiers[group.id] || {}
                            const currentCount = Object.values(selectedMods).reduce((sum, qty) => sum + qty, 0)
                            const isSatisfied = currentCount >= group.minSelect && currentCount <= group.maxSelect

                            return (
                                <div key={group.id} className="space-y-3 border border-border/40 rounded-xl p-4 bg-card/50">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-semibold text-base">{group.name}</h4>
                                            <p className="text-xs text-muted-foreground">
                                                {group.minSelect > 0 ? (
                                                    <span className="text-orange-600 font-medium">Obligatorio (mín. {group.minSelect})</span>
                                                ) : (
                                                    <span>Opcional</span>
                                                )}
                                                {group.maxSelect > 1 && ` - Máx. ${group.maxSelect}`}
                                            </p>
                                        </div>
                                        <Badge variant={isSatisfied ? "outline" : "secondary"} className={isSatisfied ? "bg-green-50 text-green-700 border-green-200" : "bg-orange-50 text-orange-700 border-orange-200"}>
                                            {currentCount} / {group.maxSelect}
                                        </Badge>
                                    </div>

                                    <div className="grid grid-cols-1 gap-2">
                                        {group.modifiers.map((mod: POSModifier) => {
                                            const qty = selectedMods[mod.id] || 0
                                            const isSelected = qty > 0
                                            return (
                                                <div
                                                    key={mod.id}
                                                    className={`
                                                        flex items-center justify-between p-3 rounded-lg border transition cursor-pointer
                                                        ${isSelected ? 'border-primary bg-primary/5' : 'hover:bg-muted/50 border-border/40 bg-muted/20'}
                                                    `}
                                                    onClick={() => {
                                                        if (group.maxSelect === 1) {
                                                            if (isSelected) {
                                                                handleModifierQuantityChange(group.id, mod.id, -1, group.maxSelect)
                                                            } else {
                                                                handleModifierQuantityChange(group.id, mod.id, 1, group.maxSelect)
                                                            }
                                                        }
                                                    }}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        {group.maxSelect === 1 && (
                                                            <div className={`h-4 w-4 rounded-full border border-primary flex items-center justify-center ${isSelected ? 'bg-primary' : ''}`}>
                                                                {isSelected && <div className="h-2 w-2 rounded-full bg-primary-foreground" />}
                                                            </div>
                                                        )}
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-medium">{mod.name}</span>
                                                            {mod.price > 0 && (
                                                                <span className="text-xs font-mono text-muted-foreground">+ {formatCurrency(mod.price)}</span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {group.maxSelect > 1 && (
                                                        <div className="flex items-center gap-3" onClick={e => e.stopPropagation()}>
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="h-8 w-8 rounded-full shadow-sm"
                                                                onClick={() => handleModifierQuantityChange(group.id, mod.id, -1, group.maxSelect)}
                                                                disabled={qty === 0}
                                                            >
                                                                <Minus className="h-4 w-4" />
                                                            </Button>
                                                            <span className="w-4 text-center text-sm font-semibold tabular-nums">{qty}</span>
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="h-8 w-8 rounded-full shadow-sm"
                                                                onClick={() => handleModifierQuantityChange(group.id, mod.id, 1, group.maxSelect)}
                                                                disabled={currentCount >= group.maxSelect}
                                                            >
                                                                <Plus className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )
                        })}

                        {/* QUANTITY */}
                        <div className="bg-muted/10 p-4 rounded-xl space-y-3">
                            <h4 className="font-medium text-sm text-center uppercase tracking-wider text-muted-foreground">Cantidad</h4>
                            <div className="flex items-center justify-center gap-6">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-12 w-12 rounded-full shadow-sm"
                                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                                    disabled={quantity <= 1}
                                >
                                    <Minus className="h-6 w-6" />
                                </Button>
                                <span className="text-4xl font-black w-16 text-center tabular-nums">{quantity}</span>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-12 w-12 rounded-full shadow-sm"
                                    onClick={() => setQuantity(prev => prev + 1)}
                                >
                                    <Plus className="h-6 w-6" />
                                </Button>
                            </div>
                        </div>

                    </div>
                </ScrollArea>

                <div className="p-4 border-t border-border/40 bg-background shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                    <Button
                        className="w-full h-14 text-lg font-bold shadow-md"
                        size="lg"
                        onClick={handleAddToCart}
                    >
                        <div className="flex items-center justify-between w-full px-4">
                            <span>Agregar al Pedido</span>
                            <span className="bg-primary-foreground/20 px-2 py-0.5 rounded text-base">
                                {formatCurrency(totalPrice)}
                            </span>
                        </div>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
