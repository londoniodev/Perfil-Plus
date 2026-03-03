"use server"

import { API_BASE } from "@/lib/config"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// Strict TypeScript schema to prevent malicious or flawed payloads (No arrays of any allowed)
const CreateOrderSchema = z.object({
    orderType: z.enum(["DINE_IN", "PICKUP", "DELIVERY"]),
    tableId: z.string().nullable().optional(),
    items: z.array(z.object({
        variantId: z.string().min(1, "Variante inválida"),
        quantity: z.number().int().min(1, "Cantidad debe ser al menos 1"),
        modifiers: z.array(z.object({
            id: z.string().or(z.object({ id: z.string() })).transform(val => typeof val === 'string' ? val : val.id).optional(),
            modifierId: z.string().optional(),
            quantity: z.number().int().min(1).default(1)
        })).optional().default([])
    })).min(1, "La orden debe contener al menos un elemento")
})

export async function createOrder(data: unknown, items: unknown, tableId: string | null = null) {
    try {
        // Enforce strict type validation using Zod
        const parsed = CreateOrderSchema.parse({
            orderType: (data as any)?.orderType,
            tableId,
            items: items
        })

        // 1. Map validated items to Backend DTO
        const orderItems = parsed.items.map(item => ({
            variantId: item.variantId,
            quantity: item.quantity,
            modifiers: item.modifiers?.map(mod => ({
                modifierId: mod.modifierId || mod.id,
                quantity: mod.quantity
            })) || []
        }))

        // 2. Construct Payload
        const payload = {
            orderType: parsed.tableId ? "DINE_IN" : parsed.orderType,
            tableNumber: parsed.tableId || undefined,
            items: orderItems,
            // Customer Info (API might need update to store this in Order or User)
            // For now, valid 'CreateOrderDto' only has items, orderType, tableNumber.
            // Client data might need to be passed in headers or a separate field if logic allows.
            // However, usually we create a User or Guest.
            // Let's assume for now we just send the order. 
            // TODO: Add customer info support in API if missing.
        }

        const headersList = await headers()
        const tenantId = headersList.get("x-tenant-id") || "template"

        // 3. Call API
        const res = await fetch(`${API_BASE}/orders`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-tenant-id": tenantId
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
