import { z } from "zod";

export const variantSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Nombre requerido"),
    sku: z.string().optional(),
    price: z.coerce.number().optional().nullable(),
    stock: z.coerce.number().int().min(-1).default(0),
    isDefault: z.boolean().default(false),
    attributes: z.record(z.string(), z.any()).optional()
});

export const modifierSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Nombre requerido"),
    priceAdjustment: z.coerce.number().default(0),
    stock: z.coerce.number().nullable().optional(),
    isAvailable: z.boolean().default(true)
});

export const modifierGroupSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Nombre del grupo requerido"),
    minSelect: z.coerce.number().min(0).default(0),
    maxSelect: z.coerce.number().min(1).default(1),
    modifiers: z.array(modifierSchema).min(1, "Debe tener al menos una opción")
}).refine((group) => group.minSelect <= group.maxSelect, {
    message: "El mínimo de selección no puede ser mayor al máximo",
    path: ["minSelect"]
});

export const productSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "El nombre es requerido"),
    description: z.string().min(1, "La descripción es requerida"),
    productType: z.enum(["DIGITAL", "PHYSICAL", "RESTAURANT"]),
    basePrice: z.coerce.number().min(0, "El precio debe ser mayor o igual a 0"),
    images: z.array(z.string()).min(1, "Debe subir al menos una imagen"),
    published: z.boolean().default(false),
    categories: z.array(z.string()).optional().default([]),
    
    // Specs (Digital/Physical specifics)
    downloadUrl: z.string().optional(),
    videoUrl: z.string().optional(),
    courseId: z.string().optional(),
    pages: z.coerce.number().optional(),
    format: z.string().optional(),
    weight: z.string().optional(),
    dimensions: z.string().optional(),
    
    // Compatibility for backend DTOs
    specs: z.record(z.string(), z.any()).optional(),
    
    // Arrays
    variants: z.array(variantSchema).optional().default([]),
    modifierGroups: z.array(modifierGroupSchema).optional().default([]),
    attachments: z.array(z.object({
        name: z.string().min(1, "Nombre requerido"),
        url: z.string().min(1, "URL requerida")
    })).optional().default([]),
}).superRefine((data, ctx) => {
    if (data.productType === "DIGITAL") {
        if (!data.downloadUrl && !data.courseId) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "La URL de descarga o un curso es requerido para productos digitales",
                path: ["downloadUrl"]
            });
        }
    }

    if (data.productType === "PHYSICAL") {
        if (!data.variants || data.variants.length === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Debe agregar al menos una variante para productos físicos",
                path: ["variants"]
            });
        }
    }
});

export type ProductFormValues = z.infer<typeof productSchema>;
export type VariantValues = z.infer<typeof variantSchema>;
export type ModifierValues = z.infer<typeof modifierSchema>;
export type ModifierGroupValues = z.infer<typeof modifierGroupSchema>;
