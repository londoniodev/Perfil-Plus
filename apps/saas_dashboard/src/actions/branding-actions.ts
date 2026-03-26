"use server";

import { serverFetch } from "@/lib/api-server";
import { revalidateTag } from "next/cache";
import { revalidateStorefront } from "@/lib/revalidate-storefront";
import { getSessionUser } from "@/lib/auth-server";

export async function updateTenantBranding(data: any) {
    try {
        await serverFetch('/tenant/branding', {
            method: 'PATCH',
            body: JSON.stringify({ design: data })
        });

        const user = await getSessionUser();
        
        if (user) {
            try {
                // No bloqueamos totalmente el éxito si la revalidación tarda, 
                // pero logueamos el intento.
                await revalidateStorefront({ tag: `tenant-${user.tenantId}-branding` });
                revalidateTag(`tenant-${user.tenantId}`, "default");
            } catch (revError) {
                console.warn(`[Branding Action] Error no crítico en revalidación:`, revError);
            }
        }

        return { success: true };
    } catch (e) {
        console.error("[Branding Action] ERROR FATAL:", e);
        throw new Error("Failed to update branding");
    }
}
