"use server";

import { PrismaClient } from "@alvarosky/database-management";
import { TENANT_ID } from "@/lib/config";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.MANAGEMENT_DATABASE_URL,
        },
    },
});

export async function updateTenantBranding(data: any) {
    try {
        const headersList = await headers();
        const tenantHeader = headersList.get('x-tenant-id');

        // El middleware local sin dominios inyecta 'default', por lo tanto en local forzamos la variable TENANT_ID de config
        const isLocalDefault = !tenantHeader || tenantHeader === 'default';
        const slugToUpdate = isLocalDefault ? TENANT_ID : tenantHeader;

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
