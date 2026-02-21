"use server"

import { prisma, Prisma } from "@alvarosky/database"
import { getSessionUser } from "@/lib/auth-server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// Schema de validación para variantes
const variantSchema = z.object({
    name: z.string().optional(),
    sku: z.string().optional(),
    price: z.number().optional(),
    stock: z.number().int().min(-1).default(0),
    isDefault: z.boolean().default(false),
    attributes: z.record(z.string(), z.any()).optional()
})

// Schema para modificadores individuales
const modifierSchema = z.object({
    name: z.string().min(1, "Nombre requerido"),
    priceAdjustment: z.number().min(0).default(0),
    stock: z.number().nullable().optional(), // null = infinito
    isAvailable: z.boolean().default(true)
})

// Schema para grupos de modificadores
const modifierGroupSchema = z.object({
    name: z.string().min(1, "Nombre del grupo requerido"),
    minSelect: z.number().min(0).default(0),
    maxSelect: z.number().min(1).default(1),
    modifiers: z.array(modifierSchema).min(1, "Debe tener al menos una opción")
})

// Schema principal de producto
const productSchema = z.object({
    name: z.string().min(1, "El nombre es requerido"),
    description: z.string().min(1, "La descripción es requerida"),
    productType: z.enum(["DIGITAL", "PHYSICAL", "RESTAURANT"]), // Agregado RESTAURANT
    basePrice: z.number().min(0, "El precio debe ser mayor a 0"),
    images: z.array(z.string()).optional().default([]),
    specs: z.record(z.string(), z.any()).optional(),
    published: z.boolean().default(false),
    categories: z.array(z.string()).optional(), // New category field
    variants: z.array(variantSchema).optional(),
    modifierGroups: z.array(modifierGroupSchema).optional()
})

type CreateProductInput = z.infer<typeof productSchema>

interface CreateProductResult {
    success: boolean
    error?: string
    productId?: string
}

/**
 * Server Action: Crear producto con sus variantes
 */
export async function createProduct(data: CreateProductInput): Promise<CreateProductResult> {
    try {
        // 1. Verificar autenticación y permisos
        const user = await getSessionUser()

        if (!user) {
            redirect("/login")
        }

        if (user.role !== "ADMIN") {
            return {
                success: false,
                error: "No tienes permisos para realizar esta acción"
            }
        }

        // 2. Validar datos
        const validated = productSchema.parse(data)

        // 3. Generar slug único desde el nombre
        const baseSlug = validated.name
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // Quitar acentos
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")

        // Verificar si el slug ya existe
        let slug = baseSlug
        let counter = 1
        while (await prisma.product.findUnique({ where: { slug } })) {
            slug = `${baseSlug}-${counter}`
            counter++
        }

        // 4. Preparar especificaciones según tipo
        let specs = validated.specs || {}

        if (validated.productType === "DIGITAL") {
            // Los specs para digitales vienen en data.specs
            // Ejemplo: { downloadUrl, pages, format }
        } else {
            // Los specs para físicos vienen en data.specs
            // Ejemplo: { weight, dimensions }
        }

        // 5. Preparar variantes
        let variantsData: typeof validated.variants = []

        if (validated.productType === "DIGITAL" || validated.productType === "RESTAURANT") {
            // Producto digital o restaurante: crear 1 variante por defecto
            variantsData = [{
                name: "Standard",
                sku: undefined, // Se generará automáticamente
                price: validated.basePrice,
                stock: -1, // Ilimitado
                isDefault: true,
                attributes: undefined
            }]
        } else {
            // Producto físico: usar las variantes proporcionadas
            if (!validated.variants || validated.variants.length === 0) {
                return {
                    success: false,
                    error: "Los productos físicos requieren al menos una variante"
                }
            }
            variantsData = validated.variants
        }

        // 6. Crear producto + variantes + modificadores en transacción
        const product = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            // Crear producto
            const newProduct = await tx.product.create({
                data: {
                    name: validated.name,
                    slug,
                    description: validated.description,
                    productType: validated.productType as any,
                    basePrice: validated.basePrice,
                    images: validated.images,
                    specs,
                    published: validated.published,
                    categories: validated.categories && validated.categories.length > 0 ? {
                        create: validated.categories.map(catId => ({
                            categoryId: catId
                        }))
                    } : undefined
                }
            })

            // Preparar datos de variantes para inserción por lotes
            const variantsToCreate = (variantsData ?? []).map((variant, i) => ({
                productId: newProduct.id,
                sku: variant.sku || `${newProduct.id.slice(0, 8).toUpperCase()}-${i + 1}`,
                name: variant.name ?? undefined,
                price: variant.price ?? validated.basePrice,
                stock: variant.stock ?? 0,
                attributes: variant.attributes ?? undefined,
                isDefault: variant.isDefault ?? ((variantsData ?? []).length === 1)
            }))

            // Crear todas las variantes
            await tx.productVariant.createMany({
                data: variantsToCreate
            })

            // Crear grupos de modificadores (Restaurante)
            if (validated.modifierGroups && validated.modifierGroups.length > 0) {
                for (const group of validated.modifierGroups) {
                    await tx.modifierGroup.create({
                        data: {
                            productId: newProduct.id,
                            name: group.name,
                            minSelect: group.minSelect,
                            maxSelect: group.maxSelect,
                            modifiers: {
                                create: group.modifiers.map(mod => ({
                                    name: mod.name,
                                    priceAdjustment: mod.priceAdjustment,
                                    stock: mod.stock === 0 ? null : mod.stock, // 0 suele enviarse como null/infinito en UI a veces, ajustar según lógica de negocio. Aquí asumimos que si viene stock, se usa.
                                    isAvailable: mod.isAvailable
                                }))
                            }
                        }
                    })
                }
            }

            return newProduct
        })

        // 7. Revalidar rutas
        revalidatePath("/admin/products")
        revalidatePath("/tienda")

        return {
            success: true,
            productId: product.id
        }

    } catch (error) {
        console.error("Error creating product:", error)

        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: error.issues[0].message
            }
        }

        return {
            success: false,
            error: error instanceof Error ? error.message : "Error desconocido al crear producto"
        }
    }
}

