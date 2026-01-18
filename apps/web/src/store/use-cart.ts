import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface CartItem {
    productId: string
    variantId: string
    title: string
    subtitle?: string // Ej: "Rojo - Talla M"
    imageSrc: string
    price: number
    quantity: number
    productType: "DIGITAL" | "PHYSICAL"
}

interface CartStore {
    items: CartItem[]
    addItem: (data: CartItem) => void
    removeItem: (variantId: string) => void
    clearCart: () => void
    totalItems: () => number
    totalPrice: () => number
}

export const useCart = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],

            addItem: (data) => {
                const currentItems = get().items
                const existingItem = currentItems.find((item) => item.variantId === data.variantId)

                if (existingItem) {
                    // Si ya existe, sumamos cantidad
                    set({
                        items: currentItems.map((item) =>
                            item.variantId === data.variantId
                                ? { ...item, quantity: item.quantity + data.quantity }
                                : item
                        ),
                    })
                } else {
                    // Si es nuevo, lo agregamos
                    set({ items: [...currentItems, data] })
                }
            },

            removeItem: (id) => {
                set({ items: get().items.filter((item) => item.variantId !== id) })
            },

            clearCart: () => set({ items: [] }),

            totalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),

            totalPrice: () => get().items.reduce((total, item) => total + (item.price * item.quantity), 0),
        }),
        {
            name: 'cart-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
)
