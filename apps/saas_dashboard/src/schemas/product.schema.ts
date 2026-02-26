import { z } from "zod"

export const variantSchema = z.object({
    name: z.string().optional(),
    sku: z.string().optional(),
    price: z.number().optional(),
    stock: z.number().int().min(-1).default(0),
    isDefault: z.boolean().default(false),
    attributes: z.record(z.string(), z.any()).optional()
})

export const modifierSchema = z.object({
    name: z.string().min(1, "Nombre requerido"),
    priceAdjustment: z.number().min(0).default(0),
    stock: z.number().nullable().optional(),
    isAvailable: z.boolean().default(true)
})

export const modifierGroupSchema = z.object({
    name: z.string().min(1, "Nombre del grupo requerido"),
    minSelect: z.number().min(0).default(0),
    maxSelect: z.number().min(1).default(1),
    modifiers: z.array(modifierSchema).min(1, "Debe tener al menos una opción")
})

export const productSchema = z.object({
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
