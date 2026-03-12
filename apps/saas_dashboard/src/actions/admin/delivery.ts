"use server"

import { revalidatePath } from "next/cache"
import { serverFetch } from "@/lib/api-server"

export async function getAvailableDrivers() {
    try {
        const drivers = await serverFetch<any[]>("/admin/delivery-drivers/available");
        
        // Ensure decimal values/numbers logic or just return as is
        return drivers;
    } catch (error) {
        console.error("Error fetching available drivers:", error);
        return [];
    }
}

export async function assignDriverToOrder(orderId: string, driverId: string) {
    try {
        await serverFetch(`/admin/orders/${orderId}/assign-driver`, {
            method: 'PATCH',
            body: JSON.stringify({ driverId })
        });

        // Revalidate paths that show orders
        revalidatePath('/orders');
        revalidatePath('/admin/orders');
        revalidatePath('/restaurante/comandas');
        revalidatePath('/restaurante/despachos'); // New route to be created

        return { success: true };
    } catch (error: any) {
        console.error("Error assigning driver:", error);
        return { success: false, error: error.message };
    }
}
