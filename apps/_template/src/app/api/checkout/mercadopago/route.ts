import { NextResponse } from "next/server";
import { PrismaClient } from "@alvarosky/database";
import { MercadoPagoConfig, Preference } from 'mercadopago';

// Instanciar Prisma localmente para la ruta de Next.js
const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const { orderId } = await req.json();
        if (!orderId) {
            return NextResponse.json({ error: "orderId is required" }, { status: 400 });
        }

        const order = await prisma.order.findUnique({
            where: { id: orderId }
        });

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        const accessToken = process.env.MP_ACCESS_TOKEN;
        if (!accessToken) {
            console.error("Missing MP_ACCESS_TOKEN in backend environment variables.");
            return NextResponse.json({ error: "Payment gateway not configured" }, { status: 500 });
        }

        const client = new MercadoPagoConfig({ accessToken, options: { timeout: 5000 } });
        const preference = new Preference(client);

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        // Si tienes ngrok, reemplaza por process.env.NGROK_URL para pruebas locales de webhooks
        const notificationUrl = process.env.MP_WEBHOOK_URL ? `${process.env.MP_WEBHOOK_URL}/api/webhooks/mercadopago` : undefined;

        const response = await preference.create({
            body: {
                items: [
                    {
                        id: order.id,
                        title: `Pedido ${order.orderNumber}`,
                        quantity: 1,
                        unit_price: Number(order.totalAmount),
                        currency_id: "COP", // USD, ARS, COP, MXN etc. Asumiendo COP temporalmente.
                    }
                ],
                external_reference: order.id,
                back_urls: {
                    success: `${baseUrl}/menu?payment=success`,
                    failure: `${baseUrl}/menu?payment=failure`,
                    pending: `${baseUrl}/menu?payment=pending`
                },
                auto_return: "approved",
                notification_url: notificationUrl
            }
        });

        return NextResponse.json({ init_point: response.init_point });
    } catch (error) {
        console.error("MP Checkout Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
