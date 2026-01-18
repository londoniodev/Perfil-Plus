"use server"

import { prisma } from "@mauromera/database"
import { getSessionUser } from "@/lib/auth-server"
import { MercadoPagoConfig, Preference } from "mercadopago"
import { revalidatePath } from "next/cache"

interface CartItem {
    variantId: string
    quantity: number
}

interface ShippingData {
    address: string
    city: string
    phone: string
    name: string
}

interface PlaceOrderResult {
    success: boolean
    message?: string
    paymentUrl?: string
    orderId?: string
    error?: string
}

/**
 * Server Action: Crear orden y generar preferencia de Mercado Pago
 * 
 * @param cartItems - Array de variantes con cantidades
 * @param shippingData - Datos de envío (opcional para productos digitales)
 * @returns URL de pago de Mercado Pago o error
 */
export async function placeOrder(
    cartItems: CartItem[],
    shippingData?: ShippingData
): Promise<PlaceOrderResult> {
    try {
        // 1. Validar autenticación
        const user = await getSessionUser()
        if (!user) {
            return { success: false, error: "Usuario no autenticado" }
        }

        // 2. Validar carrito
        if (!cartItems || cartItems.length === 0) {
            return { success: false, error: "El carrito está vacío" }
        }

        // 3. Obtener configuración de Mercado Pago desde la DB
        const storeSettings = await prisma.storeSettings.findFirst()

        if (!storeSettings?.mpAccessToken) {
            return {
                success: false,
                error: "La tienda no está configurada para procesar pagos. Contacte al administrador."
            }
        }

        // 4. Validar stock y calcular total
        interface OrderItemData {
            variantId: string
            quantity: number
            price: number
            mpItem: {
                id: string
                title: string
                unit_price: number
                quantity: number
                currency_id: string
            }
        }

        const orderItemsData: OrderItemData[] = []
        let totalAmount = 0

        for (const item of cartItems) {
            const variant = await prisma.productVariant.findUnique({
                where: { id: item.variantId },
                include: { product: true }
            })

            if (!variant) {
                return { success: false, error: `Producto no encontrado: ${item.variantId}` }
            }

            // Validar stock (excepto digitales con stock ilimitado)
            if (variant.stock !== -1 && variant.stock < item.quantity) {
                return {
                    success: false,
                    error: `Stock insuficiente para ${variant.name || variant.product.name}`
                }
            }

            const itemTotal = Number(variant.price) * item.quantity
            totalAmount += itemTotal

            orderItemsData.push({
                variantId: variant.id,
                quantity: item.quantity,
                price: Number(variant.price),
                // Datos para Mercado Pago
                mpItem: {
                    id: variant.sku,
                    title: variant.name || variant.product.name,
                    unit_price: Number(variant.price),
                    quantity: item.quantity,
                    currency_id: "ARS" // Ajustar según país
                }
            })
        }

        // 5. Generar número de orden único
        const orderCount = await prisma.order.count()
        const orderNumber = `ORD-${new Date().getFullYear()}-${String(orderCount + 1).padStart(4, '0')}`

        // 6. Crear orden en transacción
        const order = await prisma.$transaction(async (tx) => {
            // Crear orden
            const newOrder = await tx.order.create({
                data: {
                    userId: user.id,
                    orderNumber,
                    totalAmount,
                    status: "PENDING",
                    shippingData: shippingData as any,
                    items: {
                        createMany: {
                            data: orderItemsData.map(item => ({
                                variantId: item.variantId,
                                quantity: item.quantity,
                                price: item.price
                            }))
                        }
                    }
                }
            })

            // Descontar stock (solo para productos con stock limitado)
            for (const item of orderItemsData) {
                const variant = await tx.productVariant.findUnique({
                    where: { id: item.variantId }
                })

                if (variant && variant.stock !== -1) {
                    await tx.productVariant.update({
                        where: { id: item.variantId },
                        data: { stock: { decrement: item.quantity } }
                    })
                }
            }

            return newOrder
        })

        // 7. Crear preferencia de Mercado Pago
        const client = new MercadoPagoConfig({
            accessToken: storeSettings.mpAccessToken
        })
        const preference = new Preference(client)

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

        if (!baseUrl) {
            throw new Error("NEXT_PUBLIC_BASE_URL is not defined")
        }

        const preferenceData = await preference.create({
            body: {
                items: orderItemsData.map(item => item.mpItem),
                external_reference: order.id,
                back_urls: {
                    success: `${baseUrl}/tienda/status?orderId=${order.id}&status=success`,
                    failure: `${baseUrl}/tienda/status?orderId=${order.id}&status=failure`,
                    pending: `${baseUrl}/tienda/status?orderId=${order.id}&status=pending`
                },
                auto_return: "approved",
                notification_url: `${baseUrl}/api/webhooks/mercadopago`, // Para webhook
                metadata: {
                    order_id: order.id,
                    order_number: order.orderNumber
                }
            }
        })

        // 8. Guardar ID de pago de MP en la orden
        await prisma.order.update({
            where: { id: order.id },
            data: { mpPaymentId: preferenceData.id }
        })

        // Revalidar rutas relevantes
        revalidatePath("/tienda")
        revalidatePath("/checkout")

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
