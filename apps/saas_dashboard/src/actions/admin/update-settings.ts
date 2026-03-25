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
    apiSettingsSchema, ApiSettingsValues 
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
            contact: {
                ...(currentConfig.contact || {}),
                whatsapp: validated.whatsapp !== undefined ? validated.whatsapp : currentConfig.contact?.whatsapp,
                instagram: validated.instagram !== undefined ? validated.instagram : currentConfig.contact?.instagram,
                facebook: validated.facebook !== undefined ? validated.facebook : currentConfig.contact?.facebook,
                address: validated.address !== undefined ? validated.address : currentConfig.contact?.address,
            },
            menu: {
                ...(currentConfig.menu || {}),
                slogan: validated.menuSlogan !== undefined ? validated.menuSlogan : currentConfig.menu?.slogan,
            },
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
            MERCADOPAGO_CONFIG: {
                ...currentConfig.MERCADOPAGO_CONFIG,
                publicKey: validated.mpPublicKey ?? currentConfig.MERCADOPAGO_CONFIG?.publicKey,
                accessToken: validated.mpAccessToken ?? currentConfig.MERCADOPAGO_CONFIG?.accessToken,
                webhookSecret: validated.mpWebhookSecret ?? currentConfig.MERCADOPAGO_CONFIG?.webhookSecret,
                clientId: validated.mpClientId ?? currentConfig.MERCADOPAGO_CONFIG?.clientId,
                clientSecret: validated.mpClientSecret ?? currentConfig.MERCADOPAGO_CONFIG?.clientSecret,
            },
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
            smtp: {
                ...currentConfig.smtp,
                host: validated.smtpHost ?? currentConfig.smtp?.host,
                port: validated.smtpPort ?? currentConfig.smtp?.port,
                secure: validated.smtpSecure ?? currentConfig.smtp?.secure,
                auth: {
                    ...currentConfig.smtp?.auth,
                    user: validated.smtpUser ?? currentConfig.smtp?.auth?.user,
                    pass: validated.smtpPass ?? currentConfig.smtp?.auth?.pass,
                }
            },
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

