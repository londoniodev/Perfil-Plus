import { redirect } from "next/navigation"
import { getSessionUser } from "@/lib/auth-server"
import { prisma } from "@alvarosky/database"
import { AdminPageWrapper } from "@alvarosky/ui"
import { SettingsForm } from "@/components/admin/settings/settings-form"

export default async function SettingsPage() {
    // 1. Verificar autenticación y rol
    const user = await getSessionUser()

    if (!user) {
        redirect("/auth/login")
    }

    if (user.role !== "ADMIN") {
        redirect("/")
    }

    // 2. Obtener configuración actual
    const settings = await prisma.storeSettings.findFirst()

    return (
        <AdminPageWrapper
            title="Configuración"
            description="Gestiona las credenciales de pago y la información de tu tienda"
        >
            <SettingsForm initialData={settings ?? undefined} />
        </AdminPageWrapper>
    )
}

