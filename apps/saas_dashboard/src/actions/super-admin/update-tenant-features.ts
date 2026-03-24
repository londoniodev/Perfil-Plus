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
    if (!user) {
        throw new Error('AUTH_REDIRECT')
    }
    if (user.role !== "SUPERADMIN") {
        throw new Error("Acceso denegado: se requiere rol SUPERADMIN")
    }
    return user
}

export async function getTenantSettingsAction(tenantSlug: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
        await validateSuperAdmin()
        const settings = await serverFetch<any>(`/tenant/${tenantSlug}/settings`)
        return { success: true, data: settings }
    } catch (e: any) {
        if (e.message === 'AUTH_REDIRECT') redirect('/login')
        return { success: false, error: e.message }
    }
}

export async function getTenantFeaturesAction(tenantSlug: string): Promise<{ success: boolean; data?: string[]; error?: string }> {
    try {
        await validateSuperAdmin()
        // Recuperamos el tenant completo para obtener sus features
        const allTenants = await serverFetch<any[]>('/tenant')
        const tenant = allTenants.find(t => t.slug === tenantSlug)

        if (!tenant) throw new Error("Tenant no encontrado")

        return { success: true, data: tenant.features || [] }
    } catch (e: any) {
        if (e.message === 'AUTH_REDIRECT') redirect('/login')
        return { success: false, error: e.message }
    }
}

/**
 * Server Action: Actualiza los ajustes generales de un tenant.
 */
export async function updateTenantSettingsAction(tenantSlug: string, settings: any): Promise<ActionResult> {
    try {
        await validateSuperAdmin()

        await serverFetch(`/tenant/${tenantSlug}/settings`, {
            method: "PATCH",
            body: JSON.stringify(settings),
        })

        return { success: true }
    } catch (error: any) {
        if (error.message === 'AUTH_REDIRECT') redirect('/login')
        console.error("[updateTenantSettingsAction] Error:", error)
        return {
            success: false,
            error: error.message || "Error al actualizar ajustes del tenant",
        }
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
        if (error.message === 'AUTH_REDIRECT') redirect('/login')
        console.error("[updateTenantFeatures] Error:", error)
        return {
            success: false,
            error: error.message || "Error al actualizar features del tenant",
        }
    }
}
