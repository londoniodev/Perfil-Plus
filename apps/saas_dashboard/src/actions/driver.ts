"use server"

import { revalidatePath } from "next/cache"
import { serverFetch } from "@/lib/api-server"

export async function getMyActiveOrders() {
    try {
        const orders = await serverFetch<any[]>("/driver/orders");
        return orders || [];
    } catch (error) {
        console.error("Error fetching driver orders:", error);
        return [];
    }
}

export async function getDriverProfile() {
    try {
        const profile = await serverFetch<any>("/driver/profile");
        return profile;
    } catch (error) {
        console.error("Error fetching driver profile:", error);
        return null;
    }
}

export async function updateDriverStatus(status: string) {
    try {
        await serverFetch('/driver/status', {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        });

        revalidatePath('/driver/pedidos');

        return { success: true };
    } catch (error: any) {
        console.error("Error updating driver status:", error);
        return { success: false, error: error.message };
    }
}

export async function markOrderAsDelivered(orderId: string) {
    try {
        await serverFetch(`/driver/orders/${orderId}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status: 'DELIVERED' })
        });

        revalidatePath('/driver/pedidos');
        revalidatePath('/restaurante/despachos');
        revalidatePath('/restaurante/comandas');

        return { success: true };
    } catch (error: any) {
        console.error("Error marking order as delivered:", error);
        return { success: false, error: error.message };
    }
}

