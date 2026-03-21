"use server";

import { serverFetch } from "@/lib/api-server";
import { revalidatePath, revalidateTag } from "next/cache";

export async function updateTenantBranding(data: any) {
    try {
        console.log(`[Branding Action - Template] Aktualizando branding via API Backend...`);

        // Al usar serverFetch, el `x-tenant-id` se inyectará dinámicamente, asegurando
        // que la API en NestJS modifique el Tenant exacto asociado al request o dominio.
        await serverFetch('/tenant/branding', {
            method: 'PATCH',
            body: JSON.stringify({ design: data })
        });

        revalidatePath("/", "layout"); // Revalidate everything to apply new theme everywhere
        // @ts-ignore - Bypass Next.js 16 type restrictiveness
        revalidateTag("tenant-branding", "max" as any); // Invalidar la caché the 5 mins

        return { success: true };
    } catch (e) {
        console.error("Error updating branding:", e);
        throw new Error("Failed to update branding");
    }
}
