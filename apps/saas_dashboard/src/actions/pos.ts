"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { API_BASE, TENANT_ID, getApiHeaders } from "../lib/config"
import { headers } from "next/headers"


// --- TYPES ---
export type POSProduct = {
    id: string
    name: string
    description: string
    image: string
    variants: {
        id: string
        name: string | null
        price: number
        stock: number
    }[]
    modifierGroups: any[] // TODO: Type correctly
}

const posOrderItemSchema = z.object({
    variantId: z.string(),
    quantity: z.number().min(1),
    modifiers: z.array(z.object({
        modifierId: z.string(),
        quantity: z.number().default(1)
    })).optional()
})

const createPOSOrderSchema = z.object({
    tableId: z.string(),
    items: z.array(posOrderItemSchema)
})

// --- ACTIONS ---

export async function getPOSProducts() {
    try {
        const resolvedHeaders = await headers();
        const dynamicTenantId = resolvedHeaders.get("x-tenant-id") || TENANT_ID;

        const res = await fetch(
            `${API_BASE}/store/products?type=RESTAURANT&allVariants=true`,
            {
                headers: { "x-tenant-id": dynamicTenantId },
                cache: "no-store",
            }
        )

        if (!res.ok) {
            console.error("Error fetching POS products from API:", res.status)
            return []
        }

        const products = await res.json()

        return products.map((p: any) => ({
            id: p.id,
            name: p.name,
            description: p.description,
            image: p.images?.[0] || "/placeholder.jpg",
            variants: (p.variants || []).map((v: any) => ({
                id: v.id,
                name: v.name,
                price: Number(v.price),
                stock: v.stock
            })),
            modifierGroups: (p.modifierGroups || []).map((g: any) => ({
                id: g.id,
                name: g.name,
                minSelect: g.minSelect,
                maxSelect: g.maxSelect,
                modifiers: (g.modifiers || []).map((m: any) => ({
                    id: m.id,
                    name: m.name,
                    price: Number(m.priceAdjustment),
                    stock: m.stock,
                    isAvailable: m.isAvailable
                }))
            }))
        }))
    } catch (error) {
        console.error("Error fetching POS products:", error)
        return []
    }
}

export async function createPOSOrder(data: z.infer<typeof createPOSOrderSchema>) {
    try {
        const { tableId, items } = createPOSOrderSchema.parse(data)

        // Transform items to match API expected DTO
        const orderItems = items.map(item => ({
            variantId: item.variantId,
            quantity: item.quantity,
            modifiers: item.modifiers?.map(m => ({
                modifierId: m.modifierId,
                quantity: m.quantity
            })) || []
        }))

        const resolvedHeaders = await headers();
        const dynamicTenantId = resolvedHeaders.get("x-tenant-id") || TENANT_ID;

        // Call API to create order (Ensures Tenant Context & Logic)
        const res = await fetch(`${API_BASE}/orders`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-tenant-id": dynamicTenantId
            },
            body: JSON.stringify({
                orderType: "DINE_IN",
                tableNumber: tableId,
                items: orderItems,
                status: "APPROVED" // Autosend to kitchen queue
                // TODO: Pass waitstaff/user info if API supports it
            })
        })

        if (!res.ok) {
            const errorText = await res.text()
            throw new Error(`API Error: ${res.status} - ${errorText}`)
        }

        const order = await res.json()

        revalidatePath("/restaurante/comandas")
        revalidatePath("/restaurante/pos")

        return { success: true, orderId: order.id }

    } catch (error: any) {
        console.error("Create POS Order Error:", error)
        return { success: false, error: error.message || "Failed to create order" }
    }
}
