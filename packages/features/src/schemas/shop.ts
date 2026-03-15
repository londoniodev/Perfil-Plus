import * as z from "zod"

export const checkoutSchema = z.object({
    customerName: z.string().min(2, "Nombre requerido"),
    customerPhone: z.string().min(7, "Teléfono requerido"),
    customerEmail: z.string().email("Email inválido"), // Requerido para productos digitales
    identification: z.string().optional(),
    orderType: z.enum(["DINE_IN", "DELIVERY", "PICKUP", "DIGITAL"]),
    notes: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    lat: z.number().optional(),
    lng: z.number().optional()
}).superRefine((data, ctx) => {
    if (data.orderType === "DELIVERY") {
        if (!data.address || data.address.length < 5) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Dirección requerida para domicilio",
                path: ["address"],
            });
        }
        if (!data.city || data.city.length < 2) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Ciudad requerida",
                path: ["city"],
            });
        }
        if (!data.lat || !data.lng) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Selecciona tu ubicación en el mapa",
                path: ["lat"],
            });
        }
    }
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>

// ESQUEMA PARA RESTAURANTES Y WHATSAPP (QUICK COMMERCE)
export const quickCommerceSchema = z.object({
    customerName: z.string().min(2, "Nombre requerido"),
    customerPhone: z.string().min(7, "Celular requerido"),
    orderType: z.enum(["DINE_IN", "DELIVERY", "PICKUP"]),
    paymentMethod: z.enum(["CASH", "MERCADOPAGO"]),
    notes: z.string().optional(),
    address: z.string().optional(),
    lat: z.number().optional(),
    lng: z.number().optional()
}).superRefine((data, ctx) => {
    if (data.orderType === "DELIVERY") {
        if (!data.address || data.address.length < 5) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Dirección requerida",
                path: ["address"],
            });
        }
        // lat/lng son opcionales — si el cliente de WhatsApp no envió GPS,
        // la dirección de texto es suficiente para procesar el pedido.
    }
});

export type QuickCommerceFormData = z.infer<typeof quickCommerceSchema>
