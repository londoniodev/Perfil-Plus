"use client"

import { useState, useMemo } from "react"
import type { PublicProduct } from "@alvarosky/restaurant-sdk"

export function useProductModifiers(product: PublicProduct) {
    const [quantity, setQuantity] = useState(1)
    const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0]?.id || product.id)
    const [selectedModifiers, setSelectedModifiers] = useState<Record<string, Record<string, { price: number; qty: number; name: string }>>>({})

    const currentVariant = product.variants?.find((v: any) => v.id === selectedVariant)
    const unitPrice = currentVariant?.price ?? product.basePrice

    const modifierTotal = Object.values(selectedModifiers).reduce((groupSum, mods) => {
        return groupSum + Object.entries(mods).reduce((sum, [_, data]) => {
            return sum + (data as any).price * (data as any).qty
        }, 0)
    }, 0)

    const totalPrice = (unitPrice + modifierTotal) * quantity

    const toggleModifier = (groupId: string, modifier: any, maxSelect: number) => {
        setSelectedModifiers(prev => {
            const group = { ...(prev[groupId] || {}) }
            if (group[modifier.id]) {
                delete group[modifier.id]
            } else {
                const currentCount = Object.keys(group).length
                if (currentCount >= maxSelect) {
                    if (maxSelect === 1) {
                        return { ...prev, [groupId]: { [modifier.id]: { price: modifier.price, qty: 1, name: modifier.name } } }
                    }
                    return prev
                }
                group[modifier.id] = { price: modifier.price, qty: 1, name: modifier.name }
            }
            return { ...prev, [groupId]: group }
        })
    }

    const validateSelections = (): boolean => {
        if (product.modifierGroups) {
            for (const group of product.modifierGroups) {
                const selectedInGroup = selectedModifiers[group.id] ? Object.keys(selectedModifiers[group.id]).length : 0;
                const minSelections = (group as any).minSelect ?? (group as any).minSelections ?? 0;
                if (selectedInGroup < minSelections) {
                    alert(`Por favor selecciona al menos ${minSelections} opción(es) para ${group.name}`);
                    return false;
                }
            }
        }
        return true;
    }

    const getFlatModifiers = () => {
        return Object.values(selectedModifiers).flatMap(group =>
            Object.entries(group).map(([id, data]) => ({
                modifierId: id,
                modifierName: (data as any).name,
                priceAdjustment: Number((data as any).price) || 0,
                quantity: (data as any).qty
            }))
        )
    }

    return {
        quantity,
        setQuantity,
        selectedVariant,
        setSelectedVariant,
        selectedModifiers,
        toggleModifier,
        currentVariant,
        unitPrice,
        modifierTotal,
        totalPrice,
        validateSelections,
        getFlatModifiers
    }
}
