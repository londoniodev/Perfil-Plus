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
            redirect("/auth/login")
        }

        if (user.role !== "ADMIN") {
            return {
                success: false,
                error: "No tienes permisos para realizar esta acción"
            }
        }

        // 2. Validar datos
        const validated = updateOrderStatusSchema.parse(data)

        // 3. Verificar que la orden existe
        const order = await prisma.order.findUnique({
            where: { id: validated.orderId }
        })

        if (!order) {
            return {
                success: false,
                error: "Orden no encontrada"
            }
        }

        // 4. Actualizar estado
        await prisma.order.update({
            where: { id: validated.orderId },
            data: {
                status: validated.status,
                updatedAt: new Date()
            }
        })

        // 5. Revalidar rutas
        revalidatePath("/admin/orders")
        revalidatePath("/dashboard/compras") // Usuario ve cambio en su panel

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

