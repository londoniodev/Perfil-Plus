"use server";

import { serverFetch } from "@/lib/api-server";
import { revalidateTag } from "next/cache";
import { revalidateStorefront } from "@/lib/revalidate-storefront";
import { getSessionUser } from "@/lib/auth-server";
import { BrandSettingsFormValues } from "@alvarosky/shared";

/**
 * Server Action para actualizar BrandSettings (Motor de Marca Blanca)
 * Invoca el endpoint PATCH /tenant/brand-settings con el JWT de la sesión.
 */
export async function updateBrandSettings(data: BrandSettingsFormValues) {
    try {
        await serverFetch('/tenant/brand-settings', {
            method: 'PATCH',
            body: JSON.stringify(data),
        });

        const user = await getSessionUser();
        if (user) {
            await revalidateStorefront({ tag: `tenant-${user.tenantId}-branding` });
            revalidateTag(`tenant-${user.tenantId}`, "default")
        }

        return { success: true };
    } catch (e: any) {
        console.error("Error updating brand settings:", e);
        return { success: false, error: e.message || "Error al actualizar la configuración de marca" };
    }
}
