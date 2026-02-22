"use client"

import { useState, useMemo, useEffect } from "react"
import { POSProduct } from "@/actions/pos"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    Button,
    RadioGroup,
    RadioGroupItem,
    Label,
    Checkbox,
    ScrollArea,
    Badge
} from "@alvarosky/ui"
import { formatCurrency } from "@/lib/utils"
import { Plus, Minus, AlertCircle } from "lucide-react"
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
            modifierName: string
            priceAdjustment: number
            quantity: number
        }[]
    }) => void
}

export function ProductSelectionDialog({ open, onOpenChange, product, onAddToCart }: ProductSelectionDialogProps) {
    const [selectedVariantId, setSelectedVariantId] = useState<string>("")
    const [quantity, setQuantity] = useState(1)

    // State for selected modifiers: GroupId -> Set of ModifierIds
    const [selectedModifiers, setSelectedModifiers] = useState<Record<string, Set<string>>>({})

    // Reset state when product changes or dialog opens
    useEffect(() => {
        if (open && product) {
            setQuantity(1)
            // Default select first variant
            const defaultVariant = product.variants.find(v => v.stock !== 0) || product.variants[0]
            setSelectedVariantId(defaultVariant?.id || "")
            setSelectedModifiers({})
        }
    }, [open, product])

    if (!product && open) {
        onOpenChange(false)
        return null
    }

    const variants = product?.variants || []

    // Find active variant object
    const activeVariant = variants.find(v => v.id === selectedVariantId) || variants[0]
    const basePrice = activeVariant ? Number(activeVariant.price) : 0

    // Calculate total price of modifiers
    const modifiersTotal = useMemo(() => {
        if (!product) return 0
        let total = 0
        product.modifierGroups.forEach(group => {
            const selectedIds = selectedModifiers[group.id] || new Set()
            group.modifiers.forEach((mod: any) => {
                if (selectedIds.has(mod.id)) {
                    total += Number(mod.price)
                }
            })
        })
        return total
    }, [product, selectedModifiers])

    const totalPrice = (basePrice + modifiersTotal) * quantity

    const handleModifierToggle = (groupId: string, modifierId: string, maxSelect: number) => {
        setSelectedModifiers(prev => {
            const currentSet = new Set(prev[groupId] || [])

            if (currentSet.has(modifierId)) {
                currentSet.delete(modifierId)
            } else {
                // If maxSelect is 1 (Radio behavior), clear others
                if (maxSelect === 1) {
                    currentSet.clear()
                    currentSet.add(modifierId)
                } else {
                    // Check max limit
                    if (currentSet.size < maxSelect) {
                        currentSet.add(modifierId)
                    } else {
                        toast.error(`Máximo ${maxSelect} opciones permitidas`)
                        return prev // No change
                    }
                }
            }

            return {
                ...prev,
                [groupId]: currentSet
            }
        })
    }

    const validateSelection = () => {
        if (!product) return false

        for (const group of product.modifierGroups) {
            const selectedCount = (selectedModifiers[group.id] || new Set()).size
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
        const appliedModifiers: any[] = []
        product.modifierGroups.forEach(group => {
            const selectedIds = selectedModifiers[group.id] || new Set()
            group.modifiers.forEach((mod: any) => {
                if (selectedIds.has(mod.id)) {
                    appliedModifiers.push({
                        modifierId: mod.id,
                        name: mod.name,
                        priceAdjustment: Number(mod.price),
                        quantity: 1 // TODO: Support quantity per modifier? Currently 1.
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
                <DialogHeader className="p-4 pb-2 border-b bg-muted/10">
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
                                            flex items-center justify-between space-x-2 border p-3 rounded-lg transition-all cursor-pointer
                                            ${selectedVariantId === variant.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-input hover:bg-muted/50'}
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
                        {product?.modifierGroups && product.modifierGroups.map((group: any) => {
                            const selectedIds = selectedModifiers[group.id] || new Set()
                            const currentCount = selectedIds.size
                            const isSatisfied = currentCount >= group.minSelect && currentCount <= group.maxSelect

                            return (
                                <div key={group.id} className="space-y-3 border rounded-xl p-4 bg-card/50">
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
                                        {group.modifiers.map((mod: any) => {
                                            const isSelected = selectedIds.has(mod.id)
                                            return (
                                                <div
                                                    key={mod.id}
                                                    className={`
                                                        flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer
                                                        ${isSelected ? 'border-primary bg-primary/5' : 'hover:bg-muted/50 border-transparent bg-muted/20'}
                                                    `}
                                                    onClick={() => handleModifierToggle(group.id, mod.id, group.maxSelect)}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        {group.maxSelect === 1 ? (
                                                            <div className={`h-4 w-4 rounded-full border border-primary flex items-center justify-center ${isSelected ? 'bg-primary' : ''}`}>
                                                                {isSelected && <div className="h-2 w-2 rounded-full bg-primary-foreground" />}
                                                            </div>
                                                        ) : (
                                                            <Checkbox checked={isSelected} />
                                                        )}
                                                        <span className="text-sm font-medium">{mod.name}</span>
                                                    </div>
                                                    {mod.price > 0 && (
                                                        <span className="text-xs font-mono text-muted-foreground">+ {formatCurrency(mod.price)}</span>
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
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    disabled={quantity <= 1}
                                >
                                    <Minus className="h-6 w-6" />
                                </Button>
                                <span className="text-4xl font-black w-16 text-center tabular-nums">{quantity}</span>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-12 w-12 rounded-full shadow-sm"
                                    onClick={() => setQuantity(quantity + 1)}
                                >
                                    <Plus className="h-6 w-6" />
                                </Button>
                            </div>
                        </div>

                    </div>
                </ScrollArea>

                <div className="p-4 border-t bg-background shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
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
