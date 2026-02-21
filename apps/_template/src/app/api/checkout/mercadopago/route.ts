import { NextResponse } from "next/server";
import { PrismaClient } from "@alvarosky/database";
import { MercadoPagoConfig, Preference } from 'mercadopago';

// Instanciar Prisma localmente para la ruta de Next.js
const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { orderId } = body;
        console.log("[MP Checkout] Received orderId:", orderId);

        if (!orderId) {
            return NextResponse.json({ error: "orderId is required" }, { status: 400 });
        }

        const order = await prisma.order.findUnique({
            where: { id: orderId }
        });

        console.log("[MP Checkout] Order found:", order ? `#${order.orderNumber} - $${order.totalAmount}` : "NOT FOUND");

        if (!order) {
            return NextResponse.json({ error: `Order not found for id: ${orderId}` }, { status: 404 });
        }

        const accessToken = process.env.MP_ACCESS_TOKEN;
        if (!accessToken) {
            console.error("[MP Checkout] Missing MP_ACCESS_TOKEN");
            return NextResponse.json({ error: "Payment gateway not configured - missing MP_ACCESS_TOKEN" }, { status: 500 });
        }

        console.log("[MP Checkout] Access token present, creating preference...");

        const client = new MercadoPagoConfig({ accessToken, options: { timeout: 10000 } });
        const preference = new Preference(client);

        // Use localhost:3000 for back_urls since that's where Next.js runs
        const baseUrl = "http://localhost:3000";
        const notificationUrl = process.env.MP_WEBHOOK_URL ? `${process.env.MP_WEBHOOK_URL}/api/webhooks/mercadopago` : undefined;

        const totalAmount = Number(order.totalAmount);
        console.log("[MP Checkout] Creating preference with amount:", totalAmount);

        const response = await preference.create({
            body: {
                items: [
                    {
                        id: order.id,
                        title: `Pedido #${order.orderNumber}`,
                        quantity: 1,
                        unit_price: totalAmount,
                        currency_id: "COP",
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

        console.log("[MP Checkout] Preference created! init_point:", response.init_point);

        if (!response.init_point) {
            console.error("[MP Checkout] No init_point in response:", JSON.stringify(response));
            return NextResponse.json({ error: "MercadoPago did not return a payment link" }, { status: 500 });
        }

        return NextResponse.json({ init_point: response.init_point });
    } catch (error: any) {
        console.error("[MP Checkout] Error:", error?.message || error);
        console.error("[MP Checkout] Full error:", JSON.stringify(error, Object.getOwnPropertyNames(error || {})));
        return NextResponse.json(
            { error: error?.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
