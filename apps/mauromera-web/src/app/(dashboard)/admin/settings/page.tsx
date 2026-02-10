import { redirect } from "next/navigation"
import { getSessionUser } from "@/lib/auth-server"
import { prisma } from "@alvarosky/database"
import { AdminPageWrapper } from "@alvarosky/ui"
import { SettingsForm } from "@/components/admin/settings/settings-form"

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
        where: { key: "TENANT_CONFIG" }
    })

    let settings = null
    if (systemSetting?.value) {
        const config = systemSetting.value as any
        settings = {
            mpAccessToken: config.mercadopago?.accessToken,
            mpPublicKey: config.mercadopago?.publicKey,
            storeName: config.name,
            storeEmail: config.email,
        }
    } else {
        // Fallback to legacy StoreSettings
        settings = await prisma.storeSettings.findFirst()
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

