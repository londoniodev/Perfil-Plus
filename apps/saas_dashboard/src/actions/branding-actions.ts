"use server";

import { serverFetch } from "@/lib/api-server";
import { revalidateTag } from "next/cache";
import { revalidateStorefront } from "@/lib/revalidate-storefront";
import { getSessionUser } from "@/lib/auth-server";

export async function updateTenantBranding(data: any) {
    try {
        console.log(`[Branding Action - Template] Aktualizando branding via API Backend...`);

        // Al usar serverFetch, el `x-tenant-id` se inyectará dinámicamente, asegurando
        // que la API en NestJS modifique el Tenant exacto asociado al request o dominio.
        await serverFetch('/tenant/branding', {
            method: 'PATCH',
            body: JSON.stringify({ design: data })
        });

        const user = await getSessionUser();
        if (user) {
            await revalidateStorefront({ tag: `tenant-${user.tenantId}-branding` });
            revalidateTag(`tenant-${user.tenantId}`, "default")
        }

        return { success: true };
    } catch (e) {
        console.error("Error updating branding:", e);
        throw new Error("Failed to update branding");
    }
}
