import { redirect } from "next/navigation"
import { getSessionUser } from "@/lib/auth-server"
import { prisma } from "@alvarosky/database"
import { FormLayout } from "@/components/layout/FormLayout"
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
        <FormLayout
            title="Configuración"
            description="Gestiona las credenciales de pago y la información de tu tienda"
            breadcrumbs={[
                { label: "Admin", href: "/admin" },
                { label: "Configuración" }
            ]}
            maxWidth="3xl"
        >
            <SettingsForm initialData={settings ?? undefined} />
        </FormLayout>
    )
}
