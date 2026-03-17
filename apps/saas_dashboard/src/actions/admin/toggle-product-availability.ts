"use server"

import { serverFetch } from "@/lib/api-server"
import { getSessionUser } from "@/lib/auth-server"
import { revalidatePath } from "next/cache"
import { revalidateStorefront } from "@/lib/revalidate-storefront"

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

        revalidatePath("/tienda/productos")
        revalidatePath("/restaurante/menu")

        // Disparar revalidación bajo demanda en la tienda pública
        await revalidateStorefront()

        return { success: true }
    } catch (error: any) {
        console.error("Error toggling product availability:", error)
        return { success: false, error: error.message || "Error al actualizar disponibilidad" }
    }
}
