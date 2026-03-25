"use server"

import { serverFetch } from "@/lib/api-server"
import { getSessionUser } from "@/lib/auth-server"
import { revalidateTag } from "next/cache"
import { revalidateStorefront } from "@/lib/revalidate-storefront"

export async function deleteProduct(productId: string) {
    try {
        const user = await getSessionUser()

        if (!user || (user.role !== "ADMIN" && user.role !== "SUPERADMIN")) {
            return { success: false, error: "No autorizado" }
        }

        await serverFetch(`/admin/products/${productId}`, {
            method: 'DELETE',
        })

        revalidateTag(`tenant-${user.tenantId}`, "default")
        revalidateTag(`tenant-${user.tenantId}-products`, "default")

        // Disparar revalidación bajo demanda en la tienda pública
        await revalidateStorefront()

        return { success: true }
    } catch (error: any) {
        console.error("Error deleting product:", error)
        return { success: false, error: error.message || "Error al eliminar el producto" }
    }
}
