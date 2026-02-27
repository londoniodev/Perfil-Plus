"use server"

import { PrismaClient, OrderStatus } from "@prisma/client"
import { revalidatePath } from "next/cache"

const prisma = new PrismaClient()

export async function getOrders(tenantId: string) {
    try {
        const orders = await prisma.order.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' },
            include: {
                items: {
                    include: {
                        variant: {
                            include: {
                                product: {
                                    select: {
                                        productType: true,
                                        name: true
                                    }
                                }
                            }
                        }
                    }
                },
                user: {
                    select: { name: true, email: true }
                }
            }
        });

        // Convertir el Decimal object de Prisma en string/número crudo para pasarlo seguro al Client Component
        return orders.map(order => ({
            ...order,
            totalAmount: Number(order.totalAmount),
            items: order.items.map(item => ({
                ...item,
                price: Number(item.price),
                // Opcional para arrastrar priceAdjustment si existe: priceAdjustment: Number(item.priceAdjustment)
            }))
        }));
    } catch (error) {
        console.error("Error fetching orders:", error);
        return [];
    }
}

export async function updateOrderStatus(orderId: string, newStatus: OrderStatus, tenantId: string) {
    try {
        await prisma.order.update({
            where: { id: orderId, tenantId },
            data: { status: newStatus }
        });

        // Revalida la ruta donde se encuentra la tabla para ver cambios inmediatos
        revalidatePath('/orders');
        revalidatePath('/admin/orders'); // Previendo ambos scopes

        return { success: true };
    } catch (error: any) {
        console.error("Error updating order status directly on Prisma:", error);
        return { success: false, error: error.message };
    }
}
