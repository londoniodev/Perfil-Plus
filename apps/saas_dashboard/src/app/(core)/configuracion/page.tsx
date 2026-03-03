import { redirect } from "next/navigation"
import { getSessionUser } from "@/lib/auth-server"
import { serverFetch } from "@/lib/api-server"
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

    // 2. Obtener configuración actual del Tenant via NestJS API
    const settings = await serverFetch<any>('/settings/tenant-config').catch(() => null);
    const branding = await serverFetch<any>('/tenant/branding').catch(() => null);

    return (
        <AdminPageWrapper
            title="Ajustes de Negocio"
            description="Gestiona la configuración general, apariencia, pagos y más."
        >
            <SettingsForm initialData={settings ?? undefined} brandingData={branding ?? undefined} />
        </AdminPageWrapper>
    )
}
