"use server"

import { prisma, Prisma } from "@alvarosky/database"
import { getSessionUser } from "@/lib/auth-server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// Reusing schemas from create-product (in a real app, move these to a shared file)
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
    stock: z.number().nullable().optional(), // null = infinito
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

        // Transaction for atomicity
        const product = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            // 1. Update Product Base
            await tx.product.update({
                where: { id },
                data: {
                    name: validated.name,
                    description: validated.description,
                    productType: validated.productType as any,
                    basePrice: validated.basePrice,
                    images: validated.images,
                    specs: validated.specs,
                    published: validated.published
                }
            })

            // 2. Handle Variants (Simplification: Delete all and re-create for physical products)
            // Ideally we should sync by ID but for now re-create strategy is safer to avoid orphans
            if (validated.productType === "PHYSICAL" && validated.variants) {
                // Delete existing variants EXCEPT default if needed, but easier to wipe and recreate
                // WARN: This changes variant IDs which might affect orders if referenced historically
                // Checking if we should just update existing ones.
                // Assuming simple update for now:
                await tx.productVariant.deleteMany({ where: { productId: id } })

                const variantsToCreate = validated.variants.map((variant, i) => ({
                    productId: id,
                    sku: variant.sku || `${validated.name.slice(0, 3).toUpperCase()}-${id.slice(0, 4)}-${i}`,
                    name: variant.name,
                    price: variant.price ?? validated.basePrice,
                    stock: variant.stock,
                    isDefault: variant.isDefault,
                    attributes: variant.attributes
                }))

                await tx.productVariant.createMany({ data: variantsToCreate })
            }


            // 3. Handle Modifier Groups (Restaurante)
            if (validated.modifierGroups) {
                // Clear existing groups (cascade deletes modifiers)
                await tx.modifierGroup.deleteMany({ where: { productId: id } })

                // Re-create groups and modifiers
                for (const group of validated.modifierGroups) {
                    await tx.modifierGroup.create({
                        data: {
                            productId: id,
                            name: group.name,
                            minSelect: group.minSelect,
                            maxSelect: group.maxSelect,
                            modifiers: {
                                create: group.modifiers.map(mod => ({
                                    name: mod.name,
                                    priceAdjustment: mod.priceAdjustment,
                                    stock: mod.stock === 0 ? null : mod.stock,
                                    isAvailable: mod.isAvailable
                                }))
                            }
                        }
                    })
                }
            }

            return { id }
        })

        revalidatePath("/admin/products")
        revalidatePath("/admin/restaurant/menu")

        return { success: true, productId: product.id }

    } catch (error) {
        console.error("Error updates product:", error)
        if (error instanceof z.ZodError) return { success: false, error: error.issues[0].message }
        return { success: false, error: "Error al actualizar producto" }
    }
}
