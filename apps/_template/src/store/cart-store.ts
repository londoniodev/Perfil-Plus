import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface CartItem {
    cartItemId: string // Identificador único: variantId + hash(modificadores)
    productId: string
    variantId: string
    title: string
    subtitle?: string // Ej: "Rojo - Talla M"
    imageSrc: string
    price: number
    quantity: number
    productType: "DIGITAL" | "PHYSICAL" | "SERVICE" | "RESTAURANT"
    modifiers?: { id: string; name: string; price: number; quantity: number }[]
    notes?: string
}

import { createStore } from 'zustand/vanilla'

export type CartState = {
    items: CartItem[]
    tableId: string | null
    tableNumber: string | null
    branchId: string | null
}

export type CartActions = {
    addItem: (data: Omit<CartItem, 'cartItemId'>) => void
    removeItem: (cartItemId: string) => void
    setTableId: (id: string | null) => void
    setTableInfo: (info: { tableId: string | null, tableNumber: string | null, branchId: string | null }) => void
    setBranchId: (id: string | null) => void
    setCart: (items: CartItem[]) => void // Sobrescribir carrito completo (para IA WhatsApp)
    clearCart: () => void
    totalItems: () => number
    totalPrice: () => number
}

export type CartStore = CartState & CartActions

export const defaultInitState: CartState = {
    items: [],
    tableId: null,
    tableNumber: null,
    branchId: null,
}

export const createCartStore = (
    initState: CartState = defaultInitState,
) => {
    return createStore<CartStore>()(
        persist(
            (set, get) => ({
                ...initState,

                setTableId: (id) => set({ tableId: id }),
                setTableInfo: (info) => {
                    set({ 
                        tableId: info.tableId, 
                        tableNumber: info.tableNumber, 
                        branchId: info.branchId 
                    });
                    if (typeof document !== 'undefined') {
                        if (info.branchId) {
                            document.cookie = `x-branch-id=${info.branchId}; path=/; max-age=31536000; SameSite=Lax`;
                        } else {
                            document.cookie = `x-branch-id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax`;
                        }
                    }
                },
                setBranchId: (id) => {
                    set({ branchId: id });
                    if (typeof document !== 'undefined') {
                        if (id) {
                            document.cookie = `x-branch-id=${id}; path=/; max-age=31536000; SameSite=Lax`;
                        } else {
                            document.cookie = `x-branch-id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax`;
                        }
                    }
                },

                addItem: (data) => {
                    // TIKTOK PIXEL: AddToCart
                    if (typeof window !== 'undefined' && (window as any).ttq) {
                        try {
                            ;(window as any).ttq.track('AddToCart', {
                                contents: [{
                                    content_id: data.productId,
                                    content_name: data.title,
                                    quantity: data.quantity,
                                    price: data.price
                                }],
                                value: data.price * data.quantity,
                                currency: 'COP'
                            })
                        } catch(e) {}
                    }

                    const currentItems = get().items
                    // Generar Hash Determinista para el identificador de la línea en carrito
                    const modifiersHash = JSON.stringify([...(data.modifiers || [])].sort((a,b) => a.id.localeCompare(b.id)))
                    const cartItemId = `${data.variantId}-${modifiersHash}`

                    const existingItemIndex = currentItems.findIndex((item) => item.cartItemId === cartItemId)

                    if (existingItemIndex > -1) {
                        const newItems = [...currentItems]
                        newItems[existingItemIndex].quantity += data.quantity
                        if (newItems[existingItemIndex].quantity <= 0) {
                            newItems.splice(existingItemIndex, 1)
                        }
                        set({ items: newItems })
                    } else {
                        if (data.quantity > 0) {
                            set({ items: [...currentItems, { ...data, cartItemId }] })
                        }
                    }
                },

                removeItem: (cartItemId) => {
                    set({ items: get().items.filter((item) => item.cartItemId !== cartItemId) })
                },

                clearCart: () => set({ items: [] }),

                setCart: (items) => set({ items, tableId: null }),

                totalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),

                totalPrice: () => {
                    return get().items.reduce((total, item) => {
                        const modifiersCost = (item.modifiers || []).reduce((sum, mod) => sum + (mod.price * (mod.quantity || 1)), 0)
                        return total + ((item.price + modifiersCost) * item.quantity)
                    }, 0)
                },
            }),
            {
                name: 'cart-storage',
                storage: createJSONStorage(() => localStorage),
                // Para evitar hidratación asimétrica: 
                // skipHydration permite que el Provider controle cuándo hidratar
                skipHydration: true, 
            }
        )
    )
}

