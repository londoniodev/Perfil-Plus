"use server"

import { serverFetch } from "@/lib/api-server"
import { getSessionUser } from "@/lib/auth-server"
import { revalidatePath } from "next/cache"

export async function deleteProduct(productId: string) {
    try {
        const user = await getSessionUser()

        if (!user || user.role !== "ADMIN") {
            return { success: false, error: "No autorizado" }
        }

        await serverFetch(`/admin/products/${productId}`, {
            method: 'DELETE',
        })

        revalidatePath("/tienda/productos")
        revalidatePath("/restaurante/menu")

        return { success: true }
    } catch (error: any) {
        console.error("Error deleting product:", error)
        return { success: false, error: error.message || "Error al eliminar el producto" }
    }
}
