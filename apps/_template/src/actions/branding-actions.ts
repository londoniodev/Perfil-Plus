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

        // Si el middleware no encuentra subdominio (local), inyecta 'default'.
        // En ese caso, la fuente de verdad absoluta DEBE ser el TENANT_ID de lib/config.
        const isLocalDefault = !tenantHeader || tenantHeader === 'default';
        const slugToUpdate = isLocalDefault ? TENANT_ID : tenantHeader;

        console.log(`[Branding Action - Template] Aktualizando slug: ${slugToUpdate}`);

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
