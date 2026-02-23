"use server"

import { serverFetch } from "@/lib/api-server"
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

        const allowedRoles = ["ADMIN", "WAITER", "KITCHEN", "CASHIER"]
        if (!user.role || !allowedRoles.includes(user.role)) {
            return {
                success: false,
                error: "No tienes permisos para realizar esta acción"
            }
        }

        // 2. Validar datos
        const validated = updateOrderStatusSchema.parse(data)

        // 3. Llamada mediante serverFetch garantizando inyección del x-tenant-id y JWT auto-incluido si aplica en api-server
        await serverFetch(`/orders/${validated.orderId}/status`, {
            method: "PATCH",
            body: JSON.stringify({ status: validated.status })
        })

        // 4. Revalidar rutas
        revalidatePath("/admin/orders")
        revalidatePath("/dashboard/compras")

        return { success: true }

    } catch (error: any) {
        console.error("Error updating order status:", error)

        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: error.issues[0].message
            }
        }

        return {
            success: false,
            error: error.message || "Error desconocido"
        }
    }
}

