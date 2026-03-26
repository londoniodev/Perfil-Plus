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

interface CartStore {
    items: CartItem[]
    tableId: string | null
    addItem: (data: Omit<CartItem, 'cartItemId'>) => void
    removeItem: (cartItemId: string) => void
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
                // Generar Hash Determinista para el identificador de la línea en carrito
                // Asegura agrupar mismas variantes que tengan EXACTAMENTE los mismos modificadores.
                const modifiersHash = JSON.stringify([...(data.modifiers || [])].sort((a,b) => a.id.localeCompare(b.id)))
                const cartItemId = `${data.variantId}-${modifiersHash}`

                const existingItemIndex = currentItems.findIndex((item) => item.cartItemId === cartItemId)

                if (existingItemIndex > -1) {
                    // Si ya existe la combinación idéntica, solo sumamos cantidad
                    const newItems = [...currentItems]
                    newItems[existingItemIndex].quantity += data.quantity
                    // Prevenir cantidades negativas o cero. Si es 0 o menor, se borra.
                    if (newItems[existingItemIndex].quantity <= 0) {
                        newItems.splice(existingItemIndex, 1)
                    }
                    set({ items: newItems })
                } else {
                    // Si es nuevo o los modificadores difieren, creamos nueva línea
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
        }
    )
)

