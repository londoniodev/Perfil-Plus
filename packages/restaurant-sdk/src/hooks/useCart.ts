"use client"

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface CartItem {
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
    image?: string
}

interface CartState {
    cart: CartItem[]
    addItem: (item: CartItem) => void
    removeItem: (variantId: string) => void
    updateQuantity: (variantId: string, quantity: number) => void
    clearCart: () => void
    total: () => number
    totalItems: () => number
}

export const useCart = create<CartState>()(
    persist(
        (set, get) => ({
            cart: [],
            addItem: (item) => {
                set((state) => {
                    const existing = state.cart.find((i) => i.variantId === item.variantId)
                    if (existing) {
                        return {
                            cart: state.cart.map((i) =>
                                i.variantId === item.variantId
                                    ? { ...i, quantity: i.quantity + item.quantity }
                                    : i
                            ),
                        }
                    }
                    return { cart: [...state.cart, item] }
                })
            },
            removeItem: (variantId) => {
                set((state) => ({
                    cart: state.cart.filter((i) => i.variantId !== variantId),
                }))
            },
            updateQuantity: (variantId, quantity) => {
                set((state) => ({
                    cart: state.cart.map((item) => {
                        if (item.variantId === variantId) {
                            return { ...item, quantity: Math.max(0, quantity) }
                        }
                        return item
                    }).filter((item) => item.quantity > 0)
                }))
            },
            clearCart: () => set({ cart: [] }),
            total: () => {
                const { cart } = get()
                return cart.reduce((sum, item) => {
                    const mods = item.modifiers.reduce(
                        (mSum, m) => mSum + m.priceAdjustment * m.quantity,
                        0
                    )
                    return sum + (item.price + mods) * item.quantity
                }, 0)
            },
            totalItems: () => {
                const { cart } = get()
                return cart.reduce((sum, item) => sum + item.quantity, 0)
            }
        }),
        {
            name: 'restaurant-cart-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
)
