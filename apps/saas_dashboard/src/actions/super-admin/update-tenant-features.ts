"use server"

import { serverFetch } from "@/lib/api-server"
import { getSessionUser } from "@/lib/auth-server"
import { redirect } from "next/navigation"
import { z } from "zod"
import { VALID_FEATURE_VALUES } from "@alvarosky/types"

// --- Schema Zod (derivado del SSOT) ---
const updateFeaturesSchema = z.object({
    tenantSlug: z.string().min(1, "Tenant Slug requerido"),
    features: z.array(z.enum(VALID_FEATURE_VALUES)),
})

type UpdateFeaturesInput = z.infer<typeof updateFeaturesSchema>

interface ActionResult {
    success: boolean
    error?: string
}

// --- Validación de Seguridad ---
async function validateSuperAdmin() {
    const user = await getSessionUser()
    if (!user) redirect("/login")
    if (user.role !== "SUPERADMIN") {
        throw new Error("Acceso denegado: se requiere rol SUPERADMIN")
    }
    return user
}

export async function getTenantFeaturesAction(tenantSlug: string): Promise<{ success: boolean; data?: string[]; error?: string }> {
    try {
        await validateSuperAdmin()
        // Ahora usamos el endpoint dedicado que acabamos de crear en el backend
        const settings = await serverFetch<any>(`/tenant/${tenantSlug}/settings`)

        if (!settings) throw new Error("Tenant no encontrado")

        // El backend devuelve features y settings mapeados. Las features se manejan aparte pero identify las tiene.
        // Espera, el getSettings de TenantService devuelve lo que SettingsService.getTenantConfig devuelve.
        // ¿SettingsService devuelve las features? No.
        
        // Pero findAll sí tiene las features. 
        // Si queremos ser 100% óptimos, podríamos añadir features a getSettings, 
        // pero por ahora usemos el identify o el findAll original.
        
        // REVISIÓN: El findAll es lo que usaba antes. Si quiero optimizar, usaré el endpoint de features si existe.
        // Pero TenantController ya tiene /tenant/:id/features? No, tiene PATCH features.
        
        // Volvamos al findAll filtrado por ahora para no romper el contrato de datos de features si GetSettings no las incluye.
        const allTenants = await serverFetch<any[]>('/tenant')
        const tenant = allTenants.find(t => t.slug === tenantSlug)

        if (!tenant) throw new Error("Tenant no encontrado")

        return { success: true, data: tenant.features || [] }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

/**
 * Server Action: Actualiza las features habilitadas de un tenant.
 * - Solo ejecutable por SUPERADMIN.
 * - Valida features contra el SSOT (AVAILABLE_FEATURES).
 * - Invalida caché Redis + ISR storefront.
 */
export async function updateTenantFeatures(input: UpdateFeaturesInput): Promise<ActionResult> {
    try {
        await validateSuperAdmin()

        const validated = updateFeaturesSchema.parse(input)

        await serverFetch(`/tenant/${validated.tenantSlug}/features`, {
            method: "PATCH",
            body: JSON.stringify({ features: validated.features }),
        })

        return { success: true }
    } catch (error: any) {
        console.error("[updateTenantFeatures] Error:", error)
        return {
            success: false,
            error: error.message || "Error al actualizar features del tenant",
        }
    }
}
