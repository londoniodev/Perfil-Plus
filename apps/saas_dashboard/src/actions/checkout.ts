"use server"

import { getSessionUser } from "@/lib/auth-server"
import { serverFetch } from "@/lib/api-server"
import { revalidateTag } from "next/cache"
import { headers } from "next/headers"
import { z } from "zod"
import { getTenantFeatures, checkTenantFeature } from "@alvarosky/shared"

// ========== SCHEMAS DE VALIDACIÓN FRONTEND ==========
const cartItemSchema = z.object({
    variantId: z.string().cuid({ message: "ID de variante inválido" }),
    quantity: z.number().int().min(1, "La cantidad debe ser al menos 1")
})

const shippingDataSchema = z.object({
    address: z.string().min(1, "La dirección es requerida"),
    city: z.string().min(1, "La ciudad es requerida"),
    phone: z.string().min(1, "El teléfono es requerido"),
    name: z.string().min(1, "El nombre es requerido"),
    lat: z.number().optional(),
    lng: z.number().optional()
}).optional()

const placeOrderSchema = z.object({
    cartItems: z.array(cartItemSchema).min(1, "El carrito está vacío"),
    shippingData: shippingDataSchema
})

type CartItem = z.infer<typeof cartItemSchema>
type ShippingData = z.infer<typeof shippingDataSchema>

interface PlaceOrderResult {
    success: boolean
    message?: string
    paymentUrl?: string
    orderId?: string
    error?: string
}

/**
 * Server Action: Crear orden delegando la lógica central a NestJS
 *
 * TikTok CAPI: Next.js NO dispara CAPI. Solo captura IP/UA del comprador y lo envía
 * a NestJS via headers. NestJS (TikTokCapiListener) es el ÚNICO responsable de CAPI.
 */
export async function placeOrder(
    cartItems: CartItem[],
    shippingData?: ShippingData
): Promise<PlaceOrderResult> {
    try {
        // 1. Validar autenticación (Opcional para Guests)
        const user = await getSessionUser()

        // 2. Validar inputs con Zod
        const validated = placeOrderSchema.parse({ cartItems, shippingData })

        // 3. Capturar IP y User-Agent REALES del comprador para atribución TikTok
        // NestJS los recibirá en headers y los propagará al TikTokCapiListener
        const headersList = await headers()
        const clientIp = headersList.get("x-forwarded-for")?.split(",")[0]?.trim()
            || headersList.get("x-real-ip")
            || "0.0.0.0"
        const clientUserAgent = headersList.get("user-agent") || "unknown"
        
        // 4. Validar Feature Flag Atómico: HAS_WEB_CHECKOUT
        const features = getTenantFeatures(headersList)
        if (!checkTenantFeature(features, "HAS_WEB_CHECKOUT")) {
            throw new Error("El servicio de venta web no está habilitado para este comercio.")
        }

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

        // 4. Crear payload para el endpoint centralizado de checkout en NestJS
        const checkoutPayload = {
            items: validated.cartItems.map(item => ({
                variantId: item.variantId,
                quantity: item.quantity
            })),
            customer: validated.shippingData ? {
                name: validated.shippingData.name || user?.name || "Cliente E-commerce",
                phone: validated.shippingData.phone || "0000000000",
                address: validated.shippingData.address,
                city: validated.shippingData.city,
                email: user?.email || undefined,
                lat: validated.shippingData.lat,
                lng: validated.shippingData.lng,
            } : undefined,
            frontUrl: baseUrl,
            paymentMethod: "MERCADO_PAGO" // Opcional, el backend fallbackeará al default del branch
        }

        // 5. Delega TODO el procesamiento, seguridad de DB y generación de pago a la API
        // Envía IP/UA del comprador para que NestJS los use en el evento TikTok CAPI
        const paymentRes = await serverFetch<any>('/payments/product/checkout', {
            method: 'POST',
            body: JSON.stringify(checkoutPayload),
            headers: {
                'x-client-ip': clientIp,
                'x-client-user-agent': clientUserAgent,
            }
        })

        if (!paymentRes || (!paymentRes.init_point && !paymentRes.sandbox_init_point)) {
            throw new Error(paymentRes?.message || "La API no devolvió una URL de pago válida");
        }

        if (user) {
            revalidateTag(`tenant-${user.tenantId}`, "default")
        }

        // 6. Retornar URL de pago
        return {
            success: true,
            message: "Orden procesada exitosamente",
            paymentUrl: paymentRes.init_point || paymentRes.sandbox_init_point,
            orderId: paymentRes.orderId || paymentRes.preferenceId // backend ahora debe retornar orderId
        }

    } catch (error) {
        console.error("Error en placeOrder:", error)
        return {
            success: false,
            error: error instanceof Error ? error.message : "Error desconocido al procesar la orden"
        }
    }
}


