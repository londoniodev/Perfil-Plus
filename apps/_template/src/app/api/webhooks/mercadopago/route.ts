import { NextResponse } from "next/server";
import { PrismaClient } from "@alvarosky/database";
import { MercadoPagoConfig, Payment } from 'mercadopago';

const prisma = new PrismaClient();

export async function POST(req: Request) {
    try {
        const url = new URL(req.url);

        // Dependiendo de cómo configures el webhook en MercadoPago, puede venir como query params
        const actionStr = url.searchParams.get("type") || url.searchParams.get("topic");
        const dataId = url.searchParams.get("data.id") || url.searchParams.get("id");

        if (actionStr === "payment" && dataId) {
            const accessToken = process.env.MP_ACCESS_TOKEN;
            if (!accessToken) {
                console.error("Missing MP_ACCESS_TOKEN for webhook processing");
                return NextResponse.json({ error: "No credentials" }, { status: 500 });
            }

            const client = new MercadoPagoConfig({ accessToken });
            const paymentClient = new Payment(client);

            // Fetch del pago seguro desde MercadoPago
            const paymentData = await paymentClient.get({ id: dataId });

            if (paymentData.status === "approved" && paymentData.external_reference) {
                const orderId = paymentData.external_reference;

                const order = await prisma.order.findUnique({
                    where: { id: orderId }
                });

                if (order && order.status !== "APPROVED" && order.status !== "DELIVERED") {

                    // Asegurar que el pago se registre en la tabla `Payment` de Prisma
                    await prisma.payment.create({
                        data: {
                            orderId: order.id,
                            amount: Number(paymentData.transaction_amount),
                            method: "MERCADOPAGO",
                            reference: paymentData.id!.toString()
                        }
                    });

                    // Actualizar el estado de la Order a APPROVED
                    await prisma.order.update({
                        where: { id: order.id },
                        data: { status: "APPROVED" }
                    });

                    // Tratamos de llamar a la API del NestJS para disparar el SSE real-time
                    try {
                        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
                        // Este tenant_id puede que sea dinámico si usamos multi-tenant
                        // Por el path normal, el user o token tiene el tenant. 
                        // Aquí como webhook usamos el slug del tenant si lo hubiéramos guardado. 
                        // O omitimos x-tenant-id y manejamos en el NestJS de alguna forma.

                        await fetch(`${apiUrl}/orders/${order.id}/status`, {
                            method: 'PATCH',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ status: 'APPROVED' })
                        });
                    } catch (e) {
                        console.error("No se pudo notificar al Backend (SSE) para Refrescar POS:", e);
                    }
                }
            }
        }

        return new NextResponse("OK", { status: 200 });
    } catch (error) {
        console.error("MercadoPago Webhook Error:", error);
        return new NextResponse("Error procesando Webhook", { status: 500 });
    }
}
