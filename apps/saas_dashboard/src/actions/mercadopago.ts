"use server"

import { serverFetch } from "@/lib/api-server"

export async function createMercadoPagoPreference(orderId: string, slug: string, baseUrl: string) {
    try {
        if (!orderId || !slug) {
            return { success: false, error: "orderId y slug son requeridos" }
        }

        console.log(`[MP Server Action] Iniciando checkout para orden ${orderId} (Tenant: ${slug})`);

        // 1. Obtener la orden del backend para validar items y precios
        const order = await serverFetch<any>(`/orders/${orderId}`, {
            headers: { 'x-tenant-id': slug }
        });

        if (!order) {
            return { success: false, error: "Orden no encontrada" }
        }

        // 2. Preparar payload para el backend de pagos
        const checkoutPayload = {
            items: order.items.map((item: any) => ({
                variantId: item.variantId || item.id, // Fallback simple
                quantity: item.quantity
            })),
            customer: {
                name: order.customerName,
                phone: order.customerPhone,
                email: order.customerEmail,
                identification: order.identification,
            },
            existingOrderId: orderId,
            frontUrl: `${baseUrl}/menu/${slug}` // Redirección tras pago
        };

        // 3. Delegar al endpoint central de la API en NestJS
        const result = await serverFetch<any>(`/payments/product/checkout`, {
            method: 'POST',
            body: JSON.stringify(checkoutPayload),
            headers: { 'x-tenant-id': slug }
        });

        if (result && (result.initPoint || result.sandboxInitPoint)) {
            return {
                success: true,
                init_point: result.initPoint || result.sandboxInitPoint 
            }
        }

        return { success: false, error: "Error al generar link de pago" }

    } catch (error: any) {
        console.error("[MP Server Action Error]:", error.message);
        return { success: false, error: error.message }
    }
}
