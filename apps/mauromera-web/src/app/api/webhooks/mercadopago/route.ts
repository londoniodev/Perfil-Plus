import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@alvarosky/database"
import { MercadoPagoConfig, Payment } from "mercadopago"

/**
 * Webhook de Mercado Pago
 * 
 * Recibe notificaciones de MP cuando cambia el estado de un pago
 * y actualiza el estado de la orden en nuestra base de datos.
 * 
 * Documentación MP: https://www.mercadopago.com.mx/developers/es/docs/your-integrations/notifications/webhooks
 */
export async function POST(request: NextRequest) {
    try {
        // 1. Parsear el payload de Mercado Pago
        const body = await request.json()

        console.log("[MP Webhook] Notificación recibida:", JSON.stringify(body, null, 2))

        // 2. Validar tipo de notificación
        // MP puede enviar diferentes tipos: payment, merchant_order, plan, subscription
        if (body.type !== "payment") {
            console.log("[MP Webhook] Tipo de notificación ignorado:", body.type)
            return NextResponse.json({ received: true }, { status: 200 })
        }

        // 3. Extraer ID del pago
        const paymentId = body.data?.id

        if (!paymentId) {
            console.error("[MP Webhook] No se encontró payment ID en el payload")
            return NextResponse.json({ error: "Missing payment ID" }, { status: 400 })
        }

        // 4. Obtener credenciales de MP desde la base de datos (TENANT_CONFIG)
        const tenantConfig = await prisma.systemSetting.findUnique({
            where: { key: "TENANT_CONFIG" }
        })

        let mpAccessToken = ""

        if (tenantConfig?.value && typeof tenantConfig.value === "object" && !Array.isArray(tenantConfig.value)) {
            const config = tenantConfig.value as Record<string, any>
            if (config.mercadopago && typeof config.mercadopago.accessToken === "string") {
                mpAccessToken = config.mercadopago.accessToken
            }
        }

        if (!mpAccessToken) {
            console.error("[MP Webhook] No hay credenciales de MP configuradas en TENANT_CONFIG")
            return NextResponse.json({ error: "Store not configured" }, { status: 500 })
        }

        // 5. Verificar el pago directamente con la API de Mercado Pago
        // NUNCA confiar solo en el payload del webhook
        const client = new MercadoPagoConfig({
            accessToken: mpAccessToken
        })
        const payment = new Payment(client)

        const paymentData = await payment.get({ id: paymentId })

        console.log("[MP Webhook] Pago verificado:", {
            id: paymentData.id,
            status: paymentData.status,
            externalReference: paymentData.external_reference
        })

        // 6. Validar que el pago tenga una referencia externa (nuestro Order ID)
        if (!paymentData.external_reference) {
            console.warn("[MP Webhook] Pago sin external_reference, ignorando")
            return NextResponse.json({ received: true }, { status: 200 })
        }

        // 7. Buscar la orden en nuestra base de datos
        const order = await prisma.order.findUnique({
            where: { id: paymentData.external_reference }
        })

        if (!order) {
            console.error("[MP Webhook] Orden no encontrada:", paymentData.external_reference)
            return NextResponse.json({ error: "Order not found" }, { status: 404 })
        }

        // 8. Actualizar estado de la orden según el estado del pago
        let newStatus = order.status // Por defecto, mantener el actual

        switch (paymentData.status) {
            case "approved":
                newStatus = "APPROVED"
                console.log("[MP Webhook] ✅ Pago aprobado, actualizando orden a APPROVED")
                break

            case "pending":
            case "in_process":
            case "in_mediation":
                newStatus = "PENDING"
                console.log("[MP Webhook] ⏳ Pago pendiente, manteniendo PENDING")
                break

            case "rejected":
            case "cancelled":
                newStatus = "CANCELLED"
                console.log("[MP Webhook] ❌ Pago rechazado/cancelado, actualizando a CANCELLED")
                break

            case "refunded":
            case "charged_back":
                newStatus = "REFUNDED"
                console.log("[MP Webhook] 💰 Pago reembolsado, actualizando a REFUNDED")
                break

            default:
                console.warn("[MP Webhook] Estado desconocido:", paymentData.status)
        }

        // 9. Actualizar orden en la base de datos
        const updatedOrder = await prisma.order.update({
            where: { id: order.id },
            data: {
                status: newStatus,
                mpPaymentId: String(paymentData.id),
                updatedAt: new Date()
            }
        })

        console.log("[MP Webhook] ✅ Orden actualizada:", {
            orderId: updatedOrder.id,
            orderNumber: updatedOrder.orderNumber,
            oldStatus: order.status,
            newStatus: updatedOrder.status
        })

        // 10. TODO: Acciones adicionales según el estado
        if (newStatus === "APPROVED") {
            // TODO: Enviar email de confirmación
            // TODO: Generar factura
            // TODO: Si es producto digital, enviar enlaces de descarga
            console.log("[MP Webhook] TODO: Enviar confirmación por email")
        } else if (newStatus === "CANCELLED") {
            // TODO: Restaurar stock de productos
            console.log("[MP Webhook] TODO: Restaurar stock")
        }

        // 11. Responder 200 rápidamente
        return NextResponse.json({
            received: true,
            orderId: updatedOrder.id,
            status: updatedOrder.status
        }, { status: 200 })

    } catch (error) {
        console.error("[MP Webhook] Error procesando webhook:", error)

        // Registrar error pero responder 200 para evitar reintentos infinitos
        // En producción, podrías usar un sistema de monitoreo como Sentry
        return NextResponse.json({
            error: "Internal server error",
            message: error instanceof Error ? error.message : String(error)
        }, { status: 500 })
    }
}

/**
 * Método GET para verificar que el endpoint está activo
 * Útil para testing
 */
export async function GET() {
    return NextResponse.json({
        status: "active",
        endpoint: "/api/webhooks/mercadopago",
        message: "Webhook endpoint is ready to receive Mercado Pago notifications"
    })
}

