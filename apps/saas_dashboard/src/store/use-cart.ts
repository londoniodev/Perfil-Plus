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
    productType: "DIGITAL" | "PHYSICAL" | "SERVICE"
    modifiers?: { id: string; name: string; price: number }[]
    notes?: string
}

interface CartStore {
    items: CartItem[]
    tableId: string | null
    addItem: (data: CartItem) => void
    removeItem: (variantId: string) => void
    setTableId: (id: string | null) => void
    setCart: (items: CartItem[]) => void // Sobrescribir carrito completo (para IA WhatsApp)
    clearCart: () => void
    totalItems: () => number
    totalPrice: () => number
}

export const useCart = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            tableId: null,

            setTableId: (id) => set({ tableId: id }),

            addItem: (data) => {
                const currentItems = get().items
                // Comparar variantId Y modificadores para agrupar
                const existingItemIndex = currentItems.findIndex((item) =>
                    item.variantId === data.variantId &&
                    JSON.stringify(item.modifiers?.sort((a, b) => a.id.localeCompare(b.id))) ===
                    JSON.stringify(data.modifiers?.sort((a, b) => a.id.localeCompare(b.id)))
                )

                if (existingItemIndex > -1) {
                    // Si ya existe idéntico, sumamos cantidad
                    const newItems = [...currentItems]
                    newItems[existingItemIndex].quantity += data.quantity
                    set({ items: newItems })
                } else {
                    // Si es nuevo (o tiene modificadores distintos), lo agregamos
                    set({ items: [...currentItems, data] })
                }
            },

            removeItem: (id) => {
                set({ items: get().items.filter((item) => item.variantId !== id) })
            },

            clearCart: () => set({ items: [] }),

            setCart: (items) => set({ items, tableId: null }),

            totalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),

            totalPrice: () => get().items.reduce((total, item) => total + (item.price * item.quantity), 0),
        }),
        {
            name: 'cart-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
)
