"use server";

import { serverFetch } from "@/lib/api-server";
import { revalidateTag } from "next/cache";
import { revalidateStorefront } from "@/lib/revalidate-storefront";
import { getSessionUser } from "@/lib/auth-server";

export async function updateTenantBranding(data: any) {
    try {
        console.log(`[Branding Action] Inicio de actualización para branding...`);
        
        const startTime = Date.now();
        await serverFetch('/tenant/branding', {
            method: 'PATCH',
            body: JSON.stringify({ design: data })
        });
        console.log(`[Branding Action] API Backend respondió en ${Date.now() - startTime}ms`);

        console.log(`[Branding Action] Obteniendo sesión de usuario...`);
        const user = await getSessionUser();
        
        if (user) {
            console.log(`[Branding Action] Iniciando revalidación para Tenant: ${user.tenantId}`);
            try {
                // No bloqueamos totalmente el éxito si la revalidación tarda, 
                // pero logueamos el intento.
                await revalidateStorefront({ tag: `tenant-${user.tenantId}-branding` });
                console.log(`[Branding Action] Revalidación de storefront completada.`);
                revalidateTag(`tenant-${user.tenantId}`, "default");
            } catch (revError) {
                console.warn(`[Branding Action] Error no crítico en revalidación:`, revError);
            }
        }

        console.log(`[Branding Action] Proceso completado exitosamente.`);
        return { success: true };
    } catch (e) {
        console.error("[Branding Action] ERROR FATAL:", e);
        throw new Error("Failed to update branding");
    }
}
