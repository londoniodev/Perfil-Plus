"use server"

import { serverFetch } from "@/lib/api-server"
import { getSessionUser } from "@/lib/auth-server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

export async function getCategories() {
    try {
        const user = await getSessionUser()
        if (!user) return []

        const categories = await serverFetch<any[]>('/categories')
        return categories || []
    } catch (error) {
        console.error("Error fetching categories:", error)
        return []
    }
}

const createCategorySchema = z.object({
    name: z.string().min(1, "El nombre es requerido")
})

export async function createCategory(name: string) {
    try {
        const user = await getSessionUser()
        if (!user || user.role !== "ADMIN") {
            return { success: false, error: "No autorizado" }
        }

        const validated = createCategorySchema.parse({ name })

        try {
            const category = await serverFetch<any>('/categories', {
                method: 'POST',
                body: JSON.stringify({ name: validated.name })
            })

            revalidatePath("/admin/products")
            return { success: true, category }
        } catch (e: any) {
            console.error("Error creating category db:", e)
            return { success: false, error: e.message || "Error al crear la categoría" }
        }

    } catch (error) {
        console.error("Error creating category:", error)
        return { success: false, error: "Error al crear categoría" }
    }
}

const updateCategorySchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1, "El nombre es requerido")
})

export async function updateCategory(id: string, name: string) {
    try {
        const user = await getSessionUser()
        if (!user || user.role !== "ADMIN") {
            return { success: false, error: "No autorizado" }
        }

        const validated = updateCategorySchema.parse({ id, name })

        const category = await serverFetch<any>(`/categories/${validated.id}`, {
            method: 'PATCH',
            body: JSON.stringify({ name: validated.name })
        })

        revalidatePath("/admin/products")
        return { success: true, category }
    } catch (error: any) {
        console.error("Error updating category:", error)
        return { success: false, error: error.message || "Error al actualizar categoría" }
    }
}

export async function deleteCategory(id: string) {
    try {
        const user = await getSessionUser()
        if (!user || user.role !== "ADMIN") {
            return { success: false, error: "No autorizado" }
        }

        await serverFetch(`/categories/${id}`, {
            method: 'DELETE'
        })

        revalidatePath("/admin/products")
        return { success: true }
    } catch (error: any) {
        console.error("Error deleting category:", error)
        return { success: false, error: error.message || "Error al eliminar categoría (puede estar en uso)" }
    }
}
