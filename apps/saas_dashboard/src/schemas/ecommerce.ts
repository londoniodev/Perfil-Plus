import { z } from "zod"

export const productSchema = z.object({
    name: z.string().min(1, "El nombre es requerido"),
    description: z.string().min(1, "La descripción es requerida"),
    productType: z.enum(["DIGITAL", "PHYSICAL", "RESTAURANT"]),
    basePrice: z.coerce.number().min(0, "El precio debe ser mayor o igual a 0"),
    images: z.array(z.string()).min(1, "Debe subir al menos una imagen"),
    published: z.boolean().default(false),
    categories: z.array(z.string()).optional(),

    // Specs condicionales
    downloadUrl: z.string().optional(),
    pages: z.coerce.number().optional(),
    format: z.string().optional(),
    weight: z.string().optional(),
    dimensions: z.string().optional(),

    // Variantes (Físico)
    variants: z.array(z.object({
        id: z.string().optional(),
        name: z.string().optional(),
        sku: z.string().optional(),
        price: z.coerce.number().optional().nullable(),
        stock: z.coerce.number().min(0, "El stock no puede ser negativo"),
        isDefault: z.boolean().default(false)
    })).optional(),

    // Modificadores (Restaurante)
    modifierGroups: z.array(z.object({
        id: z.string().optional(),
        name: z.string().min(1, "Nombre del grupo requerido"), // Ej: "Término de la carne"
        minSelect: z.coerce.number().min(0).default(0),
        maxSelect: z.coerce.number().min(1).default(1),
        modifiers: z.array(z.object({
            id: z.string().optional(),
            name: z.string().min(1, "Nombre de la opción requerido"),
            priceAdjustment: z.coerce.number().default(0),
            stock: z.coerce.number().optional().nullable(), // Opcional para control de inventario
            isAvailable: z.boolean().default(true)
        }))
    }))
        .optional()
        .refine((groups) => {
            if (!groups) return true;
            return groups.every(group => group.minSelect <= group.maxSelect);
        }, {
            message: "El mínimo de selección no puede ser mayor al máximo",
            path: ["modifierGroups"] // Se aplicará error a nivel de grupo, idealmente mapear mejor en UI
        }),

}).superRefine((data, ctx) => {
    if (data.productType === "DIGITAL") {
        if (!data.downloadUrl) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "La URL de descarga es requerida para productos digitales",
                path: ["downloadUrl"]
            })
        }
    }

    if (data.productType === "PHYSICAL") {
        if (!data.variants || data.variants.length === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Debe agregar al menos una variante para productos físicos",
                path: ["variants"]
            })
        } else {
            data.variants.forEach((variant, index) => {
                // Stock es obligatorio si no es nulo/undefined (coerce lo convierte a numero, pero checkeamos existencia lógica)
                // Zod coerce convierte "" a 0 si no se maneja, pero aquí ya forzamos number.
                // La validación min(0) ya cubre negativos.
            })
        }
    }
})

export type ProductFormValues = z.infer<typeof productSchema>
