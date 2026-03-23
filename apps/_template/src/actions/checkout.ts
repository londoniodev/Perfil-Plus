"use server"

import { getSessionUser } from "@/lib/auth-server"
import { serverFetch } from "@/lib/api-server"
import { MercadoPagoConfig, Preference } from "mercadopago"
import { revalidateTag } from "next/cache"
import { headers } from "next/headers"
import { z } from "zod"

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
 * Server Action: Crear orden delegando la lógica central a NestJS y luego generar preferencia de MP
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

        // 3. Crear payload alineado a CreateOrderDto de NestJS
        // La API de NestJS procesa precios, valida stock atómicamente y clona nombres (snapshots).
        const createOrderPayload = {
            orderType: "DELIVERY", // Default asumiendo e-commerce basado en la existencia de shippingData
            status: "PENDING",
            customerName: validated.shippingData?.name || user?.name || "Cliente E-commerce",
            customerPhone: validated.shippingData?.phone || "0000000000",
            shippingData: validated.shippingData || undefined,
            items: validated.cartItems.map(item => ({
                variantId: item.variantId,
                quantity: item.quantity
                // Los modifiers no están en el schema de input de esta App Frontend (e-commerce genérico),
                // pero si existieran, se mapearían aquí hacia el DTO de NestJS.
            }))
        }

        // 4. Delega TODO el procesamiento, seguridad de DB y aislamiento Multi-Tenant a la API
        // El api-server.ts inyecta el `x-tenant-id` garantizando que NestJS lea las config base correctas
        const order = await serverFetch<any>('/orders', {
            method: 'POST',
            body: JSON.stringify(createOrderPayload)
        })

        if (!order || !order.id) {
            throw new Error("La API no devolvió una orden válida");
        }

        // 5. Obtener configuración del Tenant DE LA API para procesar el pago. 
        // IMPORTANTE: Idealmente NestJS debería generar el Link de MP y devolverlo en la respuesta del POST /orders,
        // pero para no romper el contrato frontend existente as-is, consultamos la settings del tenant a la API.
        const mpSettings = await serverFetch<any>('/settings/tenant-config') // Asumiendo endpoint existente
        const mpAccessToken = mpSettings?.mercadopago?.accessToken;

        if (!mpAccessToken) {
            return {
                success: false,
                error: "La tienda no está configurada para procesar pagos. Contacte al administrador. Orden generada pero no cobrada."
            }
        }

        // 6. Configurar MercadoPago y Crear Preferencia
        const client = new MercadoPagoConfig({
            accessToken: mpAccessToken
        })
        const preference = new Preference(client)

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL

        if (!baseUrl) {
            throw new Error("No se ha definido la URL base de la aplicación (NEXT_PUBLIC_APP_URL)")
        }

        // Preparar "mpItems" para Mercado Pago traduciendo la orden final creada en NestJS
        const preferenceData = await preference.create({
            body: {
                items: order.items.map((item: any) => ({
                    id: item.variant.sku || item.variantId,
                    title: item.variantName || item.productName,
                    unit_price: Number(item.price),
                    quantity: item.quantity,
                    currency_id: mpSettings?.currency || "COP"
                })),
                external_reference: order.id,
                back_urls: {
                    success: `${baseUrl}/tienda/status?orderId=${order.id}&status=success`,
                    failure: `${baseUrl}/tienda/status?orderId=${order.id}&status=failure`,
                    pending: `${baseUrl}/tienda/status?orderId=${order.id}&status=pending`
                },
                auto_return: "approved",
                notification_url: `${baseUrl}/api/webhooks/mercadopago`,
                metadata: {
                    order_id: order.id,
                    order_number: order.orderNumber
                }
            }
        })

        // 7. Guardar ID de MP en la Orden
        // Idealmente hacemos un PATCH a la orden creada
        await serverFetch<any>(`/orders/${order.id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({
                status: 'PENDING',
                mpPaymentId: preferenceData.id // Si el Dto lo soporta
            })
        }).catch(e => console.error("Aviso: No se pudo enlazar mpPaymentId en BD:", e));


        const headersList = await headers();
        const tenantId = headersList.get("x-tenant-id");
        if (tenantId) {
            revalidateTag(`tenant-${tenantId}`, "default")
        }

        // 9. Retornar URL de pago
        return {
            success: true,
            message: "Orden creada exitosamente",
            paymentUrl: preferenceData.init_point || preferenceData.sandbox_init_point || undefined,
            orderId: order.id
        }

    } catch (error) {
        console.error("Error en placeOrder:", error)
        return {
            success: false,
            error: error instanceof Error ? error.message : "Error desconocido al procesar la orden"
        }
    }
}

