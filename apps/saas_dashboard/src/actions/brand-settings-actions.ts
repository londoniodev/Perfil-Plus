"use server";

import { serverFetch } from "@/lib/api-server";
import { revalidatePath, revalidateTag } from "next/cache";
import { revalidateStorefront } from "@/lib/revalidate-storefront";
import { BrandSettingsFormValues } from "@alvarosky/shared";

/**
 * Server Action para actualizar BrandSettings (Motor de Marca Blanca)
 * Invoca el endpoint PATCH /tenant/brand-settings con el JWT de la sesión.
 */
export async function updateBrandSettings(data: BrandSettingsFormValues) {
    try {
        console.log(`[Brand Settings Action] Actualizando BrandSettings via API Backend...`);

        await serverFetch('/tenant/brand-settings', {
            method: 'PATCH',
            body: JSON.stringify(data),
        });

        // Invalidar cach\u00e9 en el storefront para que el layout recargue los estilos
        await revalidateStorefront({ tag: "tenant-branding" });

        revalidatePath("/", "layout");
        // @ts-ignore - Bypass Next.js 16 type restrictiveness
        revalidateTag("tenant-branding", "max" as any);

        return { success: true };
    } catch (e: any) {
        console.error("Error updating brand settings:", e);
        return { success: false, error: e.message || "Error al actualizar la configuración de marca" };
    }
}
