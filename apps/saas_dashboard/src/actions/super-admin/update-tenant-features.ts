"use server"

import { serverFetch } from "@/lib/api-server"
import { getSessionUser } from "@/lib/auth-server"
import { redirect } from "next/navigation"
import { z } from "zod"
import { VALID_FEATURE_VALUES } from "@alvarosky/types"

// --- Schema Zod (derivado del SSOT) ---
const updateFeaturesSchema = z.object({
    tenantSlug: z.string().min(1, "Tenant Slug requerido"),
    features: z.array(z.string()),
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

        // Usamos el nuevo endpoint discriminado por ID/Slug para evitar cacheo de la lista completa
        const tenant = await serverFetch<any>(`/tenant/${tenantSlug}`, { cache: 'no-store' })

        if (!tenant) throw new Error("Tenant no encontrado")

        return { success: true, data: tenant.features || [] }
    } catch (e: any) {
        if (e.message === 'AUTH_REDIRECT') redirect('/login')
        return { success: false, error: e.message }
    }
}

import { revalidateStorefront } from "@/lib/revalidate-storefront"

/**
 * Server Action: Actualiza los ajustes generales de un tenant.
 */
export async function updateTenantSettingsAction(tenantSlug: string, settings: any): Promise<ActionResult> {
    try {
        await validateSuperAdmin()

        if (!settings || Object.keys(settings).length === 0) {
            console.warn("[updateTenantSettingsAction] No settings to update, skipping API call.");
            return { success: true };
        }

        // 1. Obtener el tenant para tener su ID y dominio real
        const tenant = await serverFetch<any>(`/tenant/${tenantSlug}`, { cache: 'no-store' });
        if (!tenant) throw new Error("Tenant no encontrado para revalidación");

        // 2. Actualizar en la DB
        await serverFetch(`/tenant/${tenantSlug}/settings`, {
            method: "PATCH",
            body: JSON.stringify(settings),
        })

        // 3. Invocar revalidación remota en el storefront del tenant
        // Intentamos obtener el dominio desde config o slug
        const tenantDomain = tenant.config?.domain || `${tenant.slug}.alvarolondono.dev`;
        
        await revalidateStorefront({ 
            tag: `tenant-branding-${tenant.id}`,
            host: tenantDomain
        });

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
 */
export async function updateTenantFeatures(input: UpdateFeaturesInput): Promise<ActionResult> {
    try {
        await validateSuperAdmin()

        const validated = updateFeaturesSchema.parse(input)

        // 1. Obtener el tenant para tener su ID y dominio real
        const tenant = await serverFetch<any>(`/tenant/${validated.tenantSlug}`, { cache: 'no-store' });
        if (!tenant) throw new Error("Tenant no encontrado para revalidación");

        // 2. Actualizar en la DB
        await serverFetch(`/tenant/${validated.tenantSlug}/features`, {
            method: "PATCH",
            body: JSON.stringify({ features: validated.features }),
        })

        // 3. Invocar revalidación remota en el storefront
        const tenantDomain = tenant.config?.domain || `${tenant.slug}.alvarolondono.dev`;

        await revalidateStorefront({ 
            tag: `tenant-branding-${tenant.id}`,
            host: tenantDomain
        });

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
