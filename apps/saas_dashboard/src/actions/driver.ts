"use server"

import { revalidatePath } from "next/cache"
import { serverFetch } from "@/lib/api-server"

export async function getMyActiveOrders() {
    try {
        const orders = await serverFetch<any[]>("/driver/orders");
        // El endpoint /driver/orders del backend ya debe estar filtrando las órdenes del driver logueado
        // y devolviendo solo ASSIGNED o IN_TRANSIT.
        return orders || [];
    } catch (error) {
        console.error("Error fetching driver orders:", error);
        return [];
    }
}

export async function markOrderAsDelivered(orderId: string) {
    try {
        await serverFetch(`/orders/${orderId}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status: 'DELIVERED' })
        });

        // Revalidate paths that show orders to the driver
        revalidatePath('/driver/pedidos');
        // Adicionalmente se refrescará para el admin
        revalidatePath('/restaurante/despachos');
        revalidatePath('/restaurante/comandas');

        return { success: true };
    } catch (error: any) {
        console.error("Error marking order as delivered:", error);
        return { success: false, error: error.message };
    }
}
