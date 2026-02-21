"use server"

import { prisma } from "@alvarosky/database"
import { getSessionUser } from "@/lib/auth-server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// Schema de validación
const updateOrderStatusSchema = z.object({
    orderId: z.string(),
    status: z.enum([
        "PENDING",
        "APPROVED",
        "PROCESSING",
        "SHIPPED",
        "DELIVERED",
        "CANCELLED",
        "REFUNDED"
    ])
})

type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>

interface UpdateOrderStatusResult {
    success: boolean
    error?: string
}

/**
 * Server Action: Actualizar estado de una orden
 */
export async function updateOrderStatus(
    data: UpdateOrderStatusInput
): Promise<UpdateOrderStatusResult> {
    try {
        // 1. Verificar autenticación y permisos
        const user = await getSessionUser()

        if (!user) {
            redirect("/login")
        }

        // Check permissions (waiter, kitchen, admin, cashier)
        const allowedRoles = ["ADMIN", "WAITER", "KITCHEN", "CASHIER"]
        if (!user.role || !allowedRoles.includes(user.role)) {
            return {
                success: false,
                error: "No tienes permisos para realizar esta acción"
            }
        }

        // 2. Validar datos
        const validated = updateOrderStatusSchema.parse(data)

        // 3. Call API (Backend logic: Stock, SSE, etc.)
        // We need to fetch with the user's token (if available) or tenant context.
        // Since this is a server action, we might not have the raw token easily if it's not in the session.
        // But api.ts handles headers. Let's see if we can use the library wrapper.
        // The library 'updateOrderStatus' at '@/lib/api' is designed for client-side mainly (uses localStorage).
        // For server-side, we should call the API URL directly or use a server-compatible wrapper.
        // Let's use fetch directly here to ensure control headers.

        const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
        const TENANT = process.env.NEXT_PUBLIC_TENANT_ID || "default" // Should come from config

        // IMPORTANT: We need the JWT to authenticate against the API if it's protected.
        // If getSessionUser returns a token, use it. If not, this is tricky.
        // Assuming session contains accessToken.

        // However, existing 'lib/api' is client-side specific (localStorage).
        // Let's try to adapt logic to call external API.

        /* 
           NOTE: The original code used direct DB access, bypassing the NestJS service logic.
           Now we MUST call the NestJS API endpoint: PATCH /admin/orders/:id/status
        */

        const res = await fetch(`${API_BASE}/admin/orders/${validated.orderId}/status`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "x-tenant-id": TENANT,
                "Authorization": `Bearer ${user.accessToken || ""}`
            },
            body: JSON.stringify({ status: validated.status })
        })

        if (!res.ok) {
            const errorText = await res.text()
            return {
                success: false,
                error: `API Error: ${errorText}`
            }
        }

        // 5. Revalidar rutas
        revalidatePath("/admin/orders")
        revalidatePath("/dashboard/compras")

        return { success: true }

    } catch (error) {
        console.error("Error updating order status:", error)

        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: error.issues[0].message
            }
        }

        return {
            success: false,
            error: error instanceof Error ? error.message : "Error desconocido"
        }
    }
}

