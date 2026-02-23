"use server"

import { serverFetch } from "@/lib/api-server"
import { getSessionUser } from "@/lib/auth-server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// Reusing schemas from create-product
const variantSchema = z.object({
    name: z.string().optional(),
    sku: z.string().optional(),
    price: z.number().optional(),
    stock: z.number().int().min(-1).default(0),
    isDefault: z.boolean().default(false),
    attributes: z.record(z.string(), z.any()).optional()
})

const modifierSchema = z.object({
    name: z.string().min(1, "Nombre requerido"),
    priceAdjustment: z.number().min(0).default(0),
    stock: z.number().nullable().optional(),
    isAvailable: z.boolean().default(true)
})

const modifierGroupSchema = z.object({
    name: z.string().min(1, "Nombre del grupo requerido"),
    minSelect: z.number().min(0).default(0),
    maxSelect: z.number().min(1).default(1),
    modifiers: z.array(modifierSchema).min(1, "Debe tener al menos una opción")
})

const productSchema = z.object({
    id: z.string(),
    name: z.string().min(1, "El nombre es requerido"),
    description: z.string().min(1, "La descripción es requerida"),
    productType: z.enum(["DIGITAL", "PHYSICAL", "RESTAURANT"]),
    basePrice: z.number().min(0, "El precio debe ser mayor a 0"),
    images: z.array(z.string()).optional().default([]),
    specs: z.record(z.string(), z.any()).optional(),
    published: z.boolean().default(false),
    categories: z.array(z.string()).optional(),
    variants: z.array(variantSchema).optional(),
    modifierGroups: z.array(modifierGroupSchema).optional()
})

type UpdateProductInput = z.infer<typeof productSchema>

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
        const id = validated.id

        const product = await serverFetch<any>(`/products/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(validated)
        })

        if (!product || !product.id) {
            throw new Error("El servidor no retornó el producto modificado")
        }

        revalidatePath("/admin/products")
        revalidatePath("/admin/restaurant/menu")

        return { success: true, productId: product.id }

    } catch (error: any) {
        console.error("Error updates product:", error)
        if (error instanceof z.ZodError) return { success: false, error: error.issues[0].message }
        return { success: false, error: error.message || "Error al actualizar producto" }
    }
}
