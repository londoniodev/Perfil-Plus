"use server"

import { serverFetch } from "@/lib/api-server"
import { getSessionUser } from "@/lib/auth-server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

import { productSchema, ProductFormValues as UpdateProductInput } from "@alvarosky/features"

interface UpdateProductResult {
    success: boolean
    error?: string
    productId?: string
}

export async function updateProduct(data: UpdateProductInput): Promise<UpdateProductResult> {
    try {
        const user = await getSessionUser()

        if (!user || user.role !== "ADMIN") {
            return { success: false, error: "No autorizado" }
        }

        const validated = productSchema.parse(data)
        const id = (data as any).id; // El id viene en el data

        // DTO de NestJS requiere estructura limpia
        const payload = {
            name: validated.name,
            description: validated.description,
            productType: validated.productType,
            basePrice: validated.basePrice,
            images: validated.images,
            specs: validated.specs,
            published: validated.published,
            modifierGroups: validated.modifierGroups,
            categories: validated.categories,
            variants: validated.variants?.map(({ id, ...v }: any) => v)
        }

        // El DTO de NestJS requiere slug
        const slug = validated.name
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")

        const product = await serverFetch<any>(`/admin/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ ...payload, slug })
        })

        if (!product || !product.id) {
            throw new Error("El servidor no retornó el producto modificado")
        }

        revalidatePath("/tienda/productos")
        revalidatePath("/restaurante/menu")

        return { success: true, productId: product.id }

    } catch (error: any) {
        console.error("Error updates product:", error)
        if (error instanceof z.ZodError) return { success: false, error: error.issues[0].message }
        return { success: false, error: error.message || "Error al actualizar producto" }
    }
}
