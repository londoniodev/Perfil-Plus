"use server"

import { API_BASE, TENANT_ID } from "@/lib/config"
import { revalidatePath } from "next/cache"

export async function createOrder(data: any, items: any[], tableId: string | null) {
    try {
        console.log("Processing order...", { data, itemsCount: items.length, tableId })

        // 1. Map items to Backend DTO
        const orderItems = items.map(item => ({
            variantId: item.variantId,
            quantity: item.quantity,
            modifiers: item.modifiers?.map((mod: any) => ({
                modifierId: mod.id,
                quantity: 1 // Default to 1 for now
            })) || []
        }))

        // 2. Construct Payload
        const payload = {
            orderType: tableId ? "DINE_IN" : data.orderType,
            tableNumber: tableId || undefined,
            items: orderItems,
            // Customer Info (API might need update to store this in Order or User)
            // For now, valid 'CreateOrderDto' only has items, orderType, tableNumber.
            // Client data might need to be passed in headers or a separate field if logic allows.
            // However, usually we create a User or Guest.
            // Let's assume for now we just send the order. 
            // TODO: Add customer info support in API if missing.
        }

        // 3. Call API
        const res = await fetch(`${API_BASE}/orders`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-tenant-id": TENANT_ID
            },
            body: JSON.stringify(payload)
        })

        if (!res.ok) {
            const err = await res.text()
            console.error("API Order Error:", err)
            throw new Error("Error al crear la orden")
        }

        const order = await res.json()

        revalidatePath("/admin/orders")
        return { success: true, orderId: order.id }

    } catch (error) {
        console.error("Create Order Action Error:", error)
        return { success: false, error: "No se pudo procesar la orden." }
    }
}
