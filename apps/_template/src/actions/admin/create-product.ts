"use server"

import { getSessionUser } from "@/lib/auth-server"
import { serverFetch } from "@/lib/api-server"
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
    productType: z.enum(["DIGITAL", "PHYSICAL", "RESTAURANT"]),
    basePrice: z.number().min(0, "El precio debe ser mayor a 0"),
    images: z.array(z.string()).optional().default([]),
    specs: z.record(z.string(), z.any()).optional(),
    published: z.boolean().default(false),
    categories: z.array(z.string()).optional(),
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
 * Server Action: Crear producto delegando al API centralizado de NestJS
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

        // 3. Generar slug único base desde el nombre (el API manejará validación de si choca)
        const baseSlug = validated.name
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // Quitar acentos
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")

        // Extraer la primera variante si hay, para mandar a Nest su stock y sku (dado que NestJS asume 1 default en la creación inicial)
        const principalVariant = validated.variants?.[0];

        // 4. Transformar payload para consumo HTTP (NestJS DTO)
        const payload = {
            name: validated.name,
            slug: baseSlug,
            description: validated.description,
            productType: validated.productType,
            basePrice: validated.basePrice,
            images: validated.images,
            specs: validated.specs,
            published: validated.published,
            // NOTA: El endpoint asume creación de variante única inicial. 
            // Inyectamos params root si corresponden o default.
            stock: principalVariant?.stock ?? (validated.productType === "DIGITAL" ? -1 : 0),
            sku: principalVariant?.sku,
            modifierGroups: validated.modifierGroups,
            // Categorías y demás arrays de variantes adicionales podrían requerir endpoints subsiguientes si NestJS 
            // no los soporta masivamente en el Dto POST /products
        }

        // 5. Llamar a NestJS a través del nuevo cliente Server
        // serverFetch inyectará de forma segura el x-tenant-id desde el middleware de Next
        const newProduct = await serverFetch<any>('/products', {
            method: 'POST',
            body: JSON.stringify(payload)
        })

        // 6. Revalidar rutas
        revalidatePath("/admin/products")
        revalidatePath("/tienda")

        return {
            success: true,
            productId: newProduct.id
        }

    } catch (error) {
        console.error("Error creating product via API:", error)

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

