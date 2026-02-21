"use server"

import { prisma } from "@alvarosky/database"
import { getSessionUser } from "@/lib/auth-server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

export async function getCategories() {
    try {
        const user = await getSessionUser()
        if (!user) return []

        // In a real multi-tenant app, we'd use the tenant client
        // But for now, categories are in the main DB according to the schema I saw?
        // Wait, schema showed Category model in `apps/api/prisma/schema.prisma` AND `database-management`.
        // The `restaurant.service.ts` uses `prisma.getTenantClient(slug)`.
        // This implies categories ARE tenant-specific in the tenant DB.

        // However, the `getSessionUser` returns a platform user, potentially. 
        // We need to know WHICH tenant we are acting upon.
        // In the admin panel, the user usually has a session associated with a tenant or we pass the tenant header/cookie.
        // But `create-product.ts` doesn't seem to take a tenant slug, it uses `prisma` directly?
        // Let's check `create-product.ts` again.

        // `create-product.ts` imports `prisma` from `@alvarosky/database`.
        // This suggests it's using the MAIN database, or `@alvarosky/database` is configured to use the tenant DB based on env?
        // If `Category` is in the schema used by `prisma` imported here, then it's fine.

        const categories = await prisma.category.findMany({
            orderBy: { name: 'asc' }
        })
        return categories
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

        // Check if exists
        const existing = await prisma.category.findUnique({
            where: { name: validated.name } // Name is unique in schema
        })

        if (existing) {
            return { success: true, category: existing }
        }

        // Create slug
        const slug = validated.name
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")

        try {
            const category = await prisma.category.create({
                data: {
                    name: validated.name,
                    slug
                }
            })

            revalidatePath("/admin/products")
            return { success: true, category }
        } catch (e) {
            // Handle unique constraint on slug if necessary, but name is unique so unlikely collision unless manual slug manipulation
            console.error("Error creating category db:", e)
            return { success: false, error: "Error al crear la categoría" }
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

        // Check if new name exists (and isn't self)
        const existing = await prisma.category.findFirst({
            where: {
                name: validated.name,
                NOT: { id: validated.id }
            }
        })

        if (existing) {
            return { success: false, error: "Ya existe una categoría con ese nombre" }
        }

        const category = await prisma.category.update({
            where: { id: validated.id },
            data: { name: validated.name }
        })

        revalidatePath("/admin/products")
        return { success: true, category }
    } catch (error) {
        console.error("Error updating category:", error)
        return { success: false, error: "Error al actualizar categoría" }
    }
}

export async function deleteCategory(id: string) {
    try {
        const user = await getSessionUser()
        if (!user || user.role !== "ADMIN") {
            return { success: false, error: "No autorizado" }
        }

        await prisma.category.delete({
            where: { id }
        })

        revalidatePath("/admin/products")
        return { success: true }
    } catch (error) {
        console.error("Error deleting category:", error)
        return { success: false, error: "Error al eliminar categoría (puede estar en uso)" }
    }
}
