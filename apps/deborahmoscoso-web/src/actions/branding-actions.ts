"use server";

import { PrismaClient } from "@alvarosky/database-management";
import { TENANT_ID } from "@/lib/config";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export async function updateTenantBranding(data: any) {
    try {
        await prisma.tenant.update({
            where: { slug: TENANT_ID },
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
