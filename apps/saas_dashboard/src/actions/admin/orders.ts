"use server"

import { OrderStatus } from "@alvarosky/database"
import { revalidateTag } from "next/cache"
import { serverFetch } from "@/lib/api-server"
import { getSessionUser } from "@/lib/auth-server"

export async function getOrders() {
    try {
        const orders = await serverFetch<any[]>("/admin/orders")

        // Convertir el Decimal object/number en número para pasarlo seguro al Client Component
        return orders.map(order => ({
            ...order,
            totalAmount: Number(order.totalAmount),
            items: order.items.map((item: any) => ({
                ...item,
                price: Number(item.price),
            }))
        }));
    } catch (error) {
        console.error("Error fetching orders via API:", error);
        return [];
    }
}

export async function updateOrderStatus(orderId: string, newStatus: OrderStatus) {
    try {
        await serverFetch(`/admin/orders/${orderId}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status: newStatus })
        });

        const user = await getSessionUser()
        if (user) {
            revalidateTag(`tenant-${user.tenantId}`, "default")
        }

        return { success: true };
    } catch (error: any) {
        console.error("Error updating order status via API:", error);
        return { success: false, error: error.message };
    }
}
