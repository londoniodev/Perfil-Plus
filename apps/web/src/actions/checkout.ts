"use server"

import { prisma, Prisma } from "@mauromera/database"
import { getSessionUser } from "@/lib/auth-server"
import { MercadoPagoConfig, Preference } from "mercadopago"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// ========== SCHEMAS DE VALIDACIÓN ==========
const cartItemSchema = z.object({
    variantId: z.string().cuid({ message: "ID de variante inválido" }),
    quantity: z.number().int().min(1, "La cantidad debe ser al menos 1")
})

const shippingDataSchema = z.object({
    address: z.string().min(1, "La dirección es requerida"),
    city: z.string().min(1, "La ciudad es requerida"),
    phone: z.string().min(1, "El teléfono es requerido"),
    name: z.string().min(1, "El nombre es requerido")
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

        // 2. Validar inputs con Zod (SEGURIDAD)
        const validated = placeOrderSchema.parse({ cartItems, shippingData })

        // 3. Obtener configuración de Mercado Pago desde la DB
        const storeSettings = await prisma.storeSettings.findFirst()

        if (!storeSettings?.mpAccessToken) {
            return {
                success: false,
                error: "La tienda no está configurada para procesar pagos. Contacte al administrador."
            }
        }

        // 4. Obtener TODAS las variantes en UNA sola consulta (FIX N+1)
        const variantIds = validated.cartItems.map(item => item.variantId)
        const variants = await prisma.productVariant.findMany({
            where: { id: { in: variantIds } },
            include: { product: true }
        })

        // Crear mapa para acceso rápido O(1)
        const variantMap = new Map(variants.map((v: any) => [v.id, v]))

        // 5. Validar stock y calcular total
        interface OrderItemData {
            variantId: string
            quantity: number
            price: number
            stock: number
            productName: string  // Snapshot
            variantName: string | null  // Snapshot
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

        for (const item of validated.cartItems) {
            const variant = variantMap.get(item.variantId)

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
                stock: variant.stock,
                productName: variant.product.name,  // Snapshot del nombre
                variantName: variant.name,  // Snapshot de la variante
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

        // 6. Crear orden en transacción con actualización atómica de stock
        const order = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            // Crear orden con snapshots de producto
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
                                price: item.price,
                                productName: item.productName,  // Snapshot inmutable
                                variantName: item.variantName   // Snapshot inmutable
                            }))
                        }
                    }
                }
            })

            // Descontar stock con ACTUALIZACIÓN ATÓMICA (Fix Race Condition)
            for (const item of orderItemsData) {
                // Solo descontar si NO es stock ilimitado (-1)
                if (item.stock !== -1) {
                    const result = await tx.productVariant.updateMany({
                        where: {
                            id: item.variantId,
                            stock: { gte: item.quantity }  // Condición atómica: solo si hay stock
                        },
                        data: {
                            stock: { decrement: item.quantity }
                        }
                    })

                    // Si no se actualizó ninguna fila, significa que no hay stock suficiente
                    if (result.count === 0) {
                        throw new Error(`Stock insuficiente para el producto. Otro usuario compró antes.`)
                    }
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
