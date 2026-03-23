"use server";

import { serverFetch } from "@/lib/api-server";
import { revalidateTag } from "next/cache";
import { headers } from "next/headers";

export async function updateTenantBranding(data: any) {
    try {
        console.log(`[Branding Action - Template] Aktualizando branding via API Backend...`);

        // Al usar serverFetch, el `x-tenant-id` se inyectará dinámicamente, asegurando
        // que la API en NestJS modifique el Tenant exacto asociado al request o dominio.
        await serverFetch('/tenant/branding', {
            method: 'PATCH',
            body: JSON.stringify({ design: data })
        });

        const headersList = await headers();
        const tenantId = headersList.get("x-tenant-id");

        if (tenantId) {
            revalidateTag(`tenant-${tenantId}`, "default");
            revalidateTag(`tenant-${tenantId}-branding`, "default");
        }

        return { success: true };
    } catch (e) {
        console.error("Error updating branding:", e);
        throw new Error("Failed to update branding");
    }
}
