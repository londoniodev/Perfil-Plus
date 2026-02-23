"use server"

import { serverFetch } from "@/lib/api-server"
import { getSessionUser } from "@/lib/auth-server"
import { revalidatePath } from "next/cache"

export async function toggleProductAvailability(productId: string, isAvailable: boolean) {
    try {
        const user = await getSessionUser()

        if (!user || user.role !== "ADMIN") {
            return { success: false, error: "No autorizado" }
        }

        await serverFetch(`/admin/products/${productId}/availability`, {
            method: 'PATCH',
            body: JSON.stringify({ isAvailable })
        })

        revalidatePath("/admin/products")
        revalidatePath("/admin/restaurant/menu")

        return { success: true }
    } catch (error: any) {
        console.error("Error toggling product availability:", error)
        return { success: false, error: error.message || "Error al actualizar disponibilidad" }
    }
}
