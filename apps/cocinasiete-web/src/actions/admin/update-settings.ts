"use server"

import { prisma } from "@alvarosky/database"
import { getSessionUser } from "@/lib/auth-server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// Schema de validación
const settingsSchema = z.object({
    // Info
    storeName: z.string().optional(),
    storeEmail: z.string().email().optional().or(z.literal("")),

    // Finance
    currency: z.string().optional(),
    mpPublicKey: z.string().optional(),
    mpAccessToken: z.string().optional(),
    mpWebhookSecret: z.string().optional(),
    mpClientId: z.string().optional(),
    mpClientSecret: z.string().optional(),

    // Appearance
    theme: z.string().optional(),
    primaryColor: z.string().optional(),

    // Email (SMTP)
    smtpHost: z.string().optional(),
    smtpPort: z.number().optional(),
    smtpSecure: z.boolean().optional(),
    smtpUser: z.string().optional(),
    smtpPass: z.string().optional(),

    // APIs
    apiKeyOpenAI: z.string().optional(),

    // Features
    enableBlog: z.boolean().optional(),
    enableStore: z.boolean().optional(),
    enableLMS: z.boolean().optional(),

    // Social & Contact
    whatsapp: z.string().optional(),
    instagram: z.string().optional(),
    facebook: z.string().optional(),
    address: z.string().optional(),

    // Menu
    menuSlogan: z.string().optional(),
    menuLogo: z.string().optional(),
})

type UpdateSettingsInput = z.infer<typeof settingsSchema>

interface UpdateSettingsResult {
    success: boolean
    error?: string
}

/**
 * Server Action: Actualizar configuración de la tienda
 */
export async function updateSettings(data: UpdateSettingsInput): Promise<UpdateSettingsResult> {
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

        // 3. Obtener configuración actual para mergear
        const tenantConfigSetting = await prisma.systemSetting.findUnique({
            where: { key: "TENANT_CONFIG" }
        })

        let currentConfig: any = {}
        if (tenantConfigSetting?.value) {
            currentConfig = typeof tenantConfigSetting.value === "string"
                ? JSON.parse(tenantConfigSetting.value)
                : tenantConfigSetting.value
        }

        // 4. Preparar nuevos objetos de configuración
        // NOTA: Nombre, Email, Moneda y Features (Módulos) están bloqueados para admins de tenant
        const newConfig = {
            ...currentConfig,
            theme: validated.theme ?? currentConfig.theme,
            primary_color: validated.primaryColor ?? currentConfig.primary_color,
            api_key_openai: validated.apiKeyOpenAI ?? currentConfig.api_key_openai,
            mercadopago: {
                ...currentConfig.mercadopago,
                publicKey: validated.mpPublicKey ?? currentConfig.mercadopago?.publicKey,
                accessToken: validated.mpAccessToken ?? currentConfig.mercadopago?.accessToken,
                webhookSecret: validated.mpWebhookSecret ?? currentConfig.mercadopago?.webhookSecret,
                clientId: validated.mpClientId ?? currentConfig.mercadopago?.clientId,
                clientSecret: validated.mpClientSecret ?? currentConfig.mercadopago?.clientSecret,
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
            }
        }

        // 5. Guardar en SystemSetting (Split Keys)

        // TENANT_CONFIG
        await prisma.systemSetting.upsert({
            where: { key: "TENANT_CONFIG" },
            create: {
                id: crypto.randomUUID(),
                key: "TENANT_CONFIG",
                value: newConfig,
                isPublic: false
            },
            update: {
                value: newConfig
            }
        })

        // SMTP_CONFIG (Flattened for EmailService)
        if (newConfig.smtp) {
            const smtpConfigForService = {
                ...newConfig.smtp,
                user: newConfig.smtp.auth?.user,
                pass: newConfig.smtp.auth?.pass,
            }
            await prisma.systemSetting.upsert({
                where: { key: "SMTP_CONFIG" },
                create: {
                    id: crypto.randomUUID(),
                    key: "SMTP_CONFIG",
                    value: smtpConfigForService,
                    isPublic: false
                },
                update: {
                    value: smtpConfigForService
                }
            })
        }

        // MERCADOPAGO_CONFIG
        if (newConfig.mercadopago) {
            await prisma.systemSetting.upsert({
                where: { key: "MERCADOPAGO_CONFIG" },
                create: {
                    id: crypto.randomUUID(),
                    key: "MERCADOPAGO_CONFIG",
                    value: newConfig.mercadopago,
                    isPublic: false
                },
                update: {
                    value: newConfig.mercadopago
                }
            })
        }

        // 6. Sincronizar con legacy StoreSettings (Opcional)
        // Solo sincronizamos campos permitidos para el admin de tenant
        const legacySettings = await prisma.storeSettings.findFirst()
        const legacyData = {
            mpPublicKey: newConfig.mercadopago?.publicKey,
            mpAccessToken: newConfig.mercadopago?.accessToken,
        }

        if (legacySettings) {
            await prisma.storeSettings.update({
                where: { id: legacySettings.id },
                data: legacyData
            })
        } else {
            await prisma.storeSettings.create({
                data: legacyData
            })
        }

        // 7. Revalidar rutas
        revalidatePath("/admin/settings")
        revalidatePath("/admin")
        revalidatePath("/")

        return { success: true }

    } catch (error) {
        console.error("Error updating settings:", error)

        if (error instanceof z.ZodError) {
            return {
                success: false,
                error: error.issues[0].message
            }
        }

        return {
            success: false,
            error: error instanceof Error ? error.message : "Error desconocido"
        }
    }
}

