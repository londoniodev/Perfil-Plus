"use server"

import { revalidatePath } from "next/cache"
import { serverFetch } from "@/lib/api-server"

export async function getAvailableDrivers() {
    try {
        const drivers = await serverFetch<any[]>("/admin/delivery-drivers/available");
        return drivers;
    } catch (error) {
        console.error("Error fetching available drivers:", error);
        return [];
    }
}

export async function getAllDrivers() {
    try {
        const drivers = await serverFetch<any[]>("/admin/delivery-drivers");
        return drivers;
    } catch (error) {
        console.error("Error fetching all drivers:", error);
        return [];
    }
}

export async function assignDriverToOrder(orderId: string, driverId: string) {
    try {
        await serverFetch(`/admin/orders/${orderId}/assign-driver`, {
            method: 'PATCH',
            body: JSON.stringify({ driverId })
        });

        revalidatePath('/restaurante/despachos');
        revalidatePath('/restaurante/despachos/domiciliarios');
        revalidatePath('/restaurante/comandas');

        return { success: true };
    } catch (error: any) {
        console.error("Error assigning driver:", error);
        return { success: false, error: error.message };
    }
}

export async function updateDriver(driverId: string, data: {
    phone?: string;
    vehicle?: string;
    status?: string;
    maxCapacity?: number;
}) {
    try {
        await serverFetch(`/admin/delivery-drivers/${driverId}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });

        revalidatePath('/restaurante/despachos');
        revalidatePath('/restaurante/despachos/domiciliarios');

        return { success: true };
    } catch (error: any) {
        console.error("Error updating driver:", error);
        return { success: false, error: error.message };
    }
}

export async function deleteDriver(driverId: string) {
    try {
        await serverFetch(`/admin/delivery-drivers/${driverId}`, {
            method: 'DELETE',
        });

        revalidatePath('/restaurante/despachos/domiciliarios');

        return { success: true };
    } catch (error: any) {
        console.error("Error deleting driver:", error);
        return { success: false, error: error.message };
    }
}

export async function createDriver(data: {
    userId: string;
    phone: string;
    vehicle?: string;
}) {
    try {
        await serverFetch('/admin/delivery-drivers', {
            method: 'POST',
            body: JSON.stringify(data),
        });

        revalidatePath('/restaurante/despachos/domiciliarios');

        return { success: true };
    } catch (error: any) {
        console.error("Error creating driver:", error);
        return { success: false, error: error.message };
    }
}
