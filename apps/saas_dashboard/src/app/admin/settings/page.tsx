import { redirect } from "next/navigation"
import { getSessionUser } from "@/lib/auth-server"
import { serverFetch } from "@/lib/api-server"
import { PageHeader } from "@alvarosky/ui"
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

    // 2. Obtener configuración actual del Tenant via NestJS API
    const settings = await serverFetch<any>('/tenant/settings').catch(() => null);

    return (
        <div className="space-y-6">
            <PageHeader
                title="Configuración"
                description="Gestiona las credenciales de pago y la información de tu tienda"
            />
            <SettingsForm initialData={settings ?? undefined} />
        </div>
    )
}
