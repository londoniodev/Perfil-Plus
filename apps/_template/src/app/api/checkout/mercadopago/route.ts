import { NextResponse } from "next/server";
import { serverFetch } from "@/lib/api-server";

/**
 * Proxy API Route para MercadoPago
 * 
 * Esta ruta actúa como puente entre el frontend público y el backend privado.
 * Evita exponer credenciales y asegura que el checkout se genere con datos válidos de la DB.
 */
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { orderId, slug } = body;

        if (!orderId || !slug) {
            return NextResponse.json({ error: "orderId y slug son requeridos" }, { status: 400 });
        }

        console.log(`[MP Proxy] Iniciando checkout para orden ${orderId} (Tenant: ${slug})`);

        // 1. Obtener la orden del backend para validar items y precios
        // Pasamos el slug como x-tenant-id para la resolución multi-tenant
        const order = await serverFetch<any>(`/orders/${orderId}`, {
            headers: { 'x-tenant-id': slug }
        });

        if (!order) {
            return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
        }

        // 2. Preparar payload para el backend de pagos
        const checkoutPayload = {
            items: order.items.map((item: any) => ({
                variantId: item.variantId,
                quantity: item.quantity
            })),
            customer: {
                name: order.customerName,
                phone: order.customerPhone,
            },
            existingOrderId: orderId,
            // URL a la que volverá el usuario tras el pago
            frontUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/menu/${slug}`
        };

        // 3. Delegar la creación de la preferencia al backend
        const result = await serverFetch<any>(`/payments/product/checkout`, {
            method: 'POST',
            body: JSON.stringify(checkoutPayload),
            headers: { 'x-tenant-id': slug }
        });

        return NextResponse.json(result);

    } catch (error: any) {
        console.error("[MP Proxy Error]:", error.message);
        return NextResponse.json(
            { error: "Error al procesar el pago con MercadoPago", details: error.message },
            { status: 500 }
        );
    }
}
