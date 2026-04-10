"use server"

import { serverFetch } from "@/lib/api-server"
import { getSessionUser } from "@/lib/auth-server"
import { redirect } from "next/navigation"
import { revalidateTag } from "next/cache"
import { z } from "zod"
import { revalidateStorefront } from "@/lib/revalidate-storefront"
import { 
    generalSettingsSchema, GeneralSettingsValues,
    financeSettingsSchema, FinanceSettingsValues,
    emailSettingsSchema, EmailSettingsValues,
    apiSettingsSchema, ApiSettingsValues,
    navigationSettingsSchema, NavigationSettingsValues,
    businessHoursSettingsSchema, BusinessHoursSettingsValues,
} from "@alvarosky/features"

interface UpdateSettingsResult {
    success: boolean
    error?: string
}

async function validateAdmin() {
    const user = await getSessionUser()
    if (!user) redirect("/login")
    if (user.role !== "ADMIN" && user.role !== "SUPERADMIN") {
        throw new Error("No tienes permisos para realizar esta acción")
    }
    return user
}

/**
 * 1. Actualizar Configuración General
 */
export async function updateGeneralSettings(data: GeneralSettingsValues): Promise<UpdateSettingsResult> {
    try {
        const user = await validateAdmin()
        const validated = generalSettingsSchema.parse(data)
        const currentConfig = await serverFetch<any>('/settings/tenant-config') || {}

        const newConfig = {
            storeName: validated.storeName ?? undefined,
            storeEmail: validated.storeEmail ?? undefined,
            enableBlog: validated.enableBlog ?? undefined,
            enableStore: validated.enableStore ?? undefined,
            enableLMS: validated.enableLMS ?? undefined,
            orderTrackingEnabled: validated.orderTrackingEnabled ?? undefined,
            // Enviar llaves planas para que SystemSetting las acepte (el API filtra objetos complejos)
            whatsapp: validated.whatsapp ?? undefined,
            instagram: validated.instagram ?? undefined,
            facebook: validated.facebook ?? undefined,
            address: validated.address ?? undefined,
        }
        
        Object.keys(newConfig).forEach(key => newConfig[key as keyof typeof newConfig] === undefined && delete newConfig[key as keyof typeof newConfig])

        await serverFetch('/settings/tenant-config', { method: 'PATCH', body: JSON.stringify(newConfig) })
        revalidateTag(`tenant-${user.tenantId}`, "default")
        // Revalidar Storefront (Branding y Datos básicos)
        await revalidateStorefront({ tag: `tenant-${user.tenantId}-branding` })
        
        return { success: true }
    } catch (error: any) {
        if (error.message?.includes("NEXT_REDIRECT")) throw error;
        return { success: false, error: error.message || "Error al actualizar configuración general" }
    }
}

/**
 * 2. Actualizar Configuración Financiera
 */
export async function updateFinanceSettings(data: FinanceSettingsValues): Promise<UpdateSettingsResult> {
    try {
        const user = await validateAdmin()
        const validated = financeSettingsSchema.parse(data)
        const currentConfig = await serverFetch<any>('/settings/tenant-config') || {}

        const newConfig = {
            activePaymentProvider: validated.activePaymentProvider ?? undefined,
            currency: validated.currency ?? undefined,
            deliveryFee: validated.deliveryFee ?? undefined,
            // Claves planas para StoreSettings en el API
            mp_public_key: validated.mpPublicKey ?? undefined,
            mp_access_token: validated.mpAccessToken ?? undefined,
            // Claves planas para SystemSetting en el API
            mpWebhookSecret: validated.mpWebhookSecret ?? undefined,
            mpClientId: validated.mpClientId ?? undefined,
            mpClientSecret: validated.mpClientSecret ?? undefined,
            // Bold credentials
            boldApiKey: validated.boldApiKey ?? undefined,
            boldSecretKey: validated.boldSecretKey ?? undefined,
        }
        Object.keys(newConfig).forEach(key => newConfig[key as keyof typeof newConfig] === undefined && delete newConfig[key as keyof typeof newConfig])

        await serverFetch('/settings/tenant-config', { method: 'PATCH', body: JSON.stringify(newConfig) })
        revalidateTag(`tenant-${user.tenantId}`, "default")
        // Revalidar Storefront (Precios de envío y moneda)
        await revalidateStorefront({ tag: `tenant-${user.tenantId}-store` })

        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message || "Error al actualizar configuración financiera" }
    }
}

/**
 * 3. Actualizar Configuración de Email
 */
export async function updateEmailSettings(data: EmailSettingsValues): Promise<UpdateSettingsResult> {
    try {
        const user = await validateAdmin()
        const validated = emailSettingsSchema.parse(data)
        const currentConfig = await serverFetch<any>('/settings/tenant-config') || {}

        const newConfig = {
            // Claves planas para SystemSetting en el API
            smtpHost: validated.smtpHost ?? undefined,
            smtpPort: validated.smtpPort ?? undefined,
            smtpSecure: validated.smtpSecure ?? undefined,
            smtpUser: validated.smtpUser ?? undefined,
            smtpPass: validated.smtpPass ?? undefined,
        }
        Object.keys(newConfig).forEach(key => newConfig[key as keyof typeof newConfig] === undefined && delete newConfig[key as keyof typeof newConfig])

        await serverFetch('/settings/tenant-config', { method: 'PATCH', body: JSON.stringify(newConfig) })
        revalidateTag(`tenant-${user.tenantId}`, "default")
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message || "Error al actualizar configuración de email" }
    }
}

/**
 * 4. Actualizar Configuración de APIs
 */
export async function updateApiSettings(data: ApiSettingsValues): Promise<UpdateSettingsResult> {
    try {
        const user = await validateAdmin()
        const validated = apiSettingsSchema.parse(data)
        const currentConfig = await serverFetch<any>('/settings/tenant-config') || {}

        const newConfig = {
            api_key_openai: validated.apiKeyOpenAI ?? undefined,
            tiktokPixelId: validated.tiktokPixelId ?? undefined,
            tiktokAccessToken: validated.tiktokAccessToken ?? undefined,
        }
        
        // Limpiar undefined para no mandar keys vacías innecesariamente
        Object.keys(newConfig).forEach(key => newConfig[key as keyof typeof newConfig] === undefined && delete newConfig[key as keyof typeof newConfig])

        await serverFetch('/settings/tenant-config', { method: 'PATCH', body: JSON.stringify(newConfig) })
        revalidateTag(`tenant-${user.tenantId}`, "default")
        // Revalidar Storefront: El TikTok Pixel ID se inyecta via branding → layout.tsx
        await revalidateStorefront({ tag: `tenant-${user.tenantId}-branding` })
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message || "Error al actualizar configuración de APIs" }
    }
}

/**
 * 5. Actualizar Navegación (Header / Footer)
 */
export async function updateNavigationSettings(data: NavigationSettingsValues): Promise<UpdateSettingsResult> {
    try {
        const user = await validateAdmin()
        const validated = navigationSettingsSchema.parse(data)
        const currentConfig = await serverFetch<any>('/settings/tenant-config') || {}
        
        const currentMenu = currentConfig.menu || {}
        const newConfig = {
            ...currentConfig,
            menu: {
                ...currentMenu,
                headerLinks: validated.headerLinks,
                footerLinks: validated.footerLinks,
            }
        }

        await serverFetch('/settings/tenant-config', { method: 'PATCH', body: JSON.stringify(newConfig) })
        revalidateTag(`tenant-${user.tenantId}`, "default")
        // Revalidar Storefront (Enlaces de navegación)
        await revalidateStorefront({ tag: `tenant-${user.tenantId}-store` })

        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message || "Error al actualizar configuración de navegación" }
    }
}

/**
 * 6. Actualizar Horarios de Atención
 */
export async function updateBusinessHoursSettings(data: BusinessHoursSettingsValues): Promise<UpdateSettingsResult> {
    try {
        const user = await validateAdmin()
        const validated = businessHoursSettingsSchema.parse(data)

        const newConfig = {
            businessHours: validated,
        }

        await serverFetch('/settings/tenant-config', { method: 'PATCH', body: JSON.stringify(newConfig) })
        revalidateTag(`tenant-${user.tenantId}`, "default")
        await revalidateStorefront({ tag: `tenant-${user.tenantId}-store` })

        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message || "Error al actualizar horarios de atención" }
    }
}
