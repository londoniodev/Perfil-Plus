"use server"

import { prisma } from "@alvarosky/database"
import { getSessionUser } from "@/lib/auth-server"
import { revalidatePath } from "next/cache"

export async function toggleProductAvailability(productId: string, isAvailable: boolean) {
    try {
        const user = await getSessionUser()

        if (!user || user.role !== "ADMIN") {
            return { success: false, error: "No autorizado" }
        }

        await prisma.product.update({
            where: { id: productId },
            data: { isAvailable }
        })

        revalidatePath("/admin/products")
        revalidatePath("/admin/restaurant/menu")

        return { success: true }
    } catch (error) {
        console.error("Error toggling product availability:", error)
        return { success: false, error: "Error al actualizar disponibilidad" }
    }
}
