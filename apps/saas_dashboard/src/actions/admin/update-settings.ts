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
            ...currentConfig,
            storeName: validated.storeName ?? currentConfig.storeName,
            storeEmail: validated.storeEmail ?? currentConfig.storeEmail,
            enableBlog: validated.enableBlog ?? currentConfig.enableBlog,
            enableStore: validated.enableStore ?? currentConfig.enableStore,
            enableLMS: validated.enableLMS ?? currentConfig.enableLMS,
            orderTrackingEnabled: validated.orderTrackingEnabled ?? currentConfig.orderTrackingEnabled,
            // Enviar llaves planas para que SystemSetting las acepte (el API filtra objetos complejos)
            whatsapp: validated.whatsapp ?? currentConfig.whatsapp,
            instagram: validated.instagram ?? currentConfig.instagram,
            facebook: validated.facebook ?? currentConfig.facebook,
            address: validated.address ?? currentConfig.address,
            menuSlogan: validated.menuSlogan ?? currentConfig.menuSlogan,
        }

        await serverFetch('/settings/tenant-config', { method: 'PATCH', body: JSON.stringify(newConfig) })
        revalidateTag(`tenant-${user.tenantId}`, "default")
        return { success: true }
    } catch (error: any) {
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
            ...currentConfig,
            currency: validated.currency ?? currentConfig.currency,
            deliveryFee: validated.deliveryFee ?? currentConfig.deliveryFee,
            // Claves planas para StoreSettings en el API
            mp_public_key: validated.mpPublicKey ?? currentConfig.mp_public_key,
            mp_access_token: validated.mpAccessToken ?? currentConfig.mp_access_token,
            // Claves planas para SystemSetting en el API
            mpWebhookSecret: validated.mpWebhookSecret ?? currentConfig.mpWebhookSecret,
            mpClientId: validated.mpClientId ?? currentConfig.mpClientId,
            mpClientSecret: validated.mpClientSecret ?? currentConfig.mpClientSecret,
        }

        await serverFetch('/settings/tenant-config', { method: 'PATCH', body: JSON.stringify(newConfig) })
        revalidateTag(`tenant-${user.tenantId}`, "default")
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
            ...currentConfig,
            // Claves planas para SystemSetting en el API
            smtpHost: validated.smtpHost ?? currentConfig.smtpHost,
            smtpPort: validated.smtpPort ?? currentConfig.smtpPort,
            smtpSecure: validated.smtpSecure ?? currentConfig.smtpSecure,
            smtpUser: validated.smtpUser ?? currentConfig.smtpUser,
            smtpPass: validated.smtpPass ?? currentConfig.smtpPass,
        }

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
            ...currentConfig,
            api_key_openai: validated.apiKeyOpenAI ?? currentConfig.api_key_openai,
        }

        await serverFetch('/settings/tenant-config', { method: 'PATCH', body: JSON.stringify(newConfig) })
        revalidateTag(`tenant-${user.tenantId}`, "default")
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
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message || "Error al actualizar configuración de navegación" }
    }
}

