import { redirect } from "next/navigation"
import { getSessionUser } from "@/lib/auth-server"
import { prisma } from "@alvarosky/database"
import { AdminPageWrapper } from "@alvarosky/ui"
import { SettingsForm } from "@/components/admin/settings/settings-form"
import { TENANT_ID } from "@/lib/config"

export default async function SettingsPage() {
    // 1. Verificar autenticación y rol
    const user = await getSessionUser()

    if (!user) {
        redirect("/login")
    }

    if (user.role !== "ADMIN") {
        redirect("/")
    }

    // 2. Obtener configuración actual de SystemSetting (Sincronizado con Platform)
    const systemSetting = await prisma.systemSetting.findUnique({
        where: { tenantId_key: { tenantId: TENANT_ID, key: "TENANT_CONFIG" } }
    })

    let settings = null
    if (systemSetting?.value) {
        const config = systemSetting.value as any
        settings = {
            mpAccessToken: config.mercadopago?.accessToken,
            mpPublicKey: config.mercadopago?.publicKey,
            mpWebhookSecret: config.mercadopago?.webhookSecret,
            mpClientId: config.mercadopago?.clientId,
            mpClientSecret: config.mercadopago?.clientSecret,
            storeName: config.name,
            storeEmail: config.email,
            currency: config.currency,
            theme: config.theme,
            primaryColor: config.primary_color,
            smtpHost: config.smtp?.host,
            smtpPort: config.smtp?.port,
            smtpSecure: config.smtp?.secure,
            smtpUser: config.smtp?.auth?.user,
            smtpPass: config.smtp?.auth?.pass,
            apiKeyOpenAI: config.api_key_openai,
            enableBlog: config.features?.blog,
            enableStore: config.features?.store,
            enableLMS: config.features?.lms,
        }
    } else {
        // Fallback to legacy StoreSettings
        const legacy = await prisma.storeSettings.findFirst({ where: { tenantId: TENANT_ID } })
        if (legacy) {
            settings = {
                storeName: legacy.storeName,
                storeEmail: legacy.storeEmail,
                mpPublicKey: legacy.mpPublicKey,
                mpAccessToken: legacy.mpAccessToken,
            }
        }
    }

    return (
        <AdminPageWrapper
            title="Configuración"
            description="Gestiona las credenciales de pago y la información de tu tienda"
        >
            <SettingsForm initialData={settings ?? undefined} />
        </AdminPageWrapper>
    )
}

