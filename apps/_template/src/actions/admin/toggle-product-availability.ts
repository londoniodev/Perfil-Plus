"use server"

import { serverFetch } from "@/lib/api-server"
import { getSessionUser } from "@/lib/auth-server"
import { revalidateTag } from "next/cache"
import { headers } from "next/headers"

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

        const headersList = await headers();
        const tenantId = headersList.get("x-tenant-id");
        if (tenantId) {
            revalidateTag(`tenant-${tenantId}`, "default")
            revalidateTag(`tenant-${tenantId}`, "default")
        }

        return { success: true }
    } catch (error: any) {
        console.error("Error toggling product availability:", error)
        return { success: false, error: error.message || "Error al actualizar disponibilidad" }
    }
}
