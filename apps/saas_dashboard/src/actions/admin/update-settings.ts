"use server"

import { serverFetch } from "@/lib/api-server"
import { getSessionUser } from "@/lib/auth-server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { settingsSchema, SettingsFormValues } from "@alvarosky/features"

interface UpdateSettingsResult {
    success: boolean
    error?: string
}

/**
 * Server Action: Actualizar configuración de la tienda delegándolo a NestJS
 */
export async function updateSettings(data: SettingsFormValues): Promise<UpdateSettingsResult> {
    try {
        // 1. Verificar autenticación y permisos
        const user = await getSessionUser()

        if (!user) {
            redirect("/login")
        }

        if (user.role !== "ADMIN") {
            return {
                success: false,
                error: "No tienes permisos para realizar esta acción"
            }
        }

        // 2. Validar datos
        const validated = settingsSchema.parse(data)

        // 3. Para no romper la lógica actual del form, obtenemos los settings primero desde la DB mediante la API
        const currentConfig = await serverFetch<any>('/settings/tenant-config') || {}

        // 4. Preparar nuevos objetos de configuración
        const newConfig = {
            ...currentConfig,
            storeName: validated.storeName ?? currentConfig.storeName,
            storeEmail: validated.storeEmail ?? currentConfig.storeEmail,
            currency: validated.currency ?? currentConfig.currency,
            enableBlog: validated.enableBlog ?? currentConfig.enableBlog,
            enableStore: validated.enableStore ?? currentConfig.enableStore,
            enableLMS: validated.enableLMS ?? currentConfig.enableLMS,
            orderTrackingEnabled: validated.orderTrackingEnabled ?? currentConfig.orderTrackingEnabled,
            theme: validated.theme ?? currentConfig.theme,
            primary_color: validated.primaryColor ?? currentConfig.primary_color,
            api_key_openai: validated.apiKeyOpenAI ?? currentConfig.api_key_openai,
            MERCADOPAGO_CONFIG: {
                ...currentConfig.MERCADOPAGO_CONFIG,
                publicKey: validated.mpPublicKey ?? currentConfig.MERCADOPAGO_CONFIG?.publicKey,
                accessToken: validated.mpAccessToken ?? currentConfig.MERCADOPAGO_CONFIG?.accessToken,
                webhookSecret: validated.mpWebhookSecret ?? currentConfig.MERCADOPAGO_CONFIG?.webhookSecret,
                clientId: validated.mpClientId ?? currentConfig.MERCADOPAGO_CONFIG?.clientId,
                clientSecret: validated.mpClientSecret ?? currentConfig.MERCADOPAGO_CONFIG?.clientSecret,
            },
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
                logo: validated.menuLogo !== undefined ? validated.menuLogo : currentConfig.menu?.logo,
            },
            deliveryFee: validated.deliveryFee ?? currentConfig.deliveryFee,
        }

        // 5. Enviar el config unificado a NestJS para que procese el guardado en SystemSettings
        await serverFetch('/settings/tenant-config', {
            method: 'PATCH',
            body: JSON.stringify(newConfig)
        })

        // 6. Revalidar rutas
        revalidatePath("/admin/settings")
        revalidatePath("/admin")
        revalidatePath("/")

        return { success: true }

    } catch (error: any) {
        console.error("Error updating settings:", error)

        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: error.issues[0].message
            }
        }

        return {
            success: false,
            error: error.message || "Error desconocido"
        }
    }
}

