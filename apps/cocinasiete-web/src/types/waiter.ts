export interface WaiterOrder {
    id: string
    createdAt: Date | string
    updatedAt: Date | string
    status: string
    totalAmount: number | string
    orderNumber: string
    customerName?: string | null
    customerPhone?: string | null
    tableNumber?: string | null
    orderType: string
    notes?: string | null
    userId?: string | null
    user?: { id: string; name: string; email: string } | null
    items: WaiterOrderItem[]
}

export interface WaiterOrderItem {
    id: string
    quantity: number
    price: number | string
    productName: string
    variantName?: string | null
    notes?: string | null
    isPaid: boolean
    modifiers: Array<{
        id: string
        modifierId: string
        modifierName: string
        priceAdjustment: number | string
        quantity: number
    }>
    variant?: {
        id: string
        name: string
        product: { id: string; name: string; images?: string[] }
    }
}
