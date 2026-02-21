"use server";

import { PrismaClient } from "@alvarosky/database-management";
import { TENANT_ID } from "@/lib/config";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

const prisma = new PrismaClient();

export async function updateTenantBranding(data: any) {
    try {
        const headersList = headers();
        const tenantHeader = headersList.get('x-tenant-id');
        // Usamos el tenant que indique el middleware, o en fallback la constante de variables de entorno, o 'cocina-siete'.
        // Aquí la magia es que el middleware resolvió mediante el subdominio si era cocina-siete o cocinasiete
        const slugToUpdate = tenantHeader || TENANT_ID || 'cocina-siete';

        // Log para que veas en caso de que vuelva a fallar exactamente qué intentaba buscar
        console.log(`[Branding Action] Intentando actualizar el tenant slug: ${slugToUpdate}`);

        await prisma.tenant.update({
            where: { slug: slugToUpdate },
            data: {
                design: data // JSON field
            }
        });

        revalidatePath("/"); // Revalidate everything to apply new theme
        return { success: true };
    } catch (e) {
        console.error("Error updating branding:", e);
        throw new Error("Failed to update branding");
    }
}
