import { redirect } from "next/navigation"
import { getSessionUser } from "@/lib/auth-server"
import { AdminPageWrapper } from "@alvarosky/ui"
import { getAllProductsCost } from "@/actions/admin/inventory"
import { CostingClient } from "@/components/inventory/CostingClient"
import { serverFetch } from "@/lib/api-server"

export default async function CostingPage() {
    const user = await getSessionUser()
    if (!user) redirect("/login")
    if (user.role !== "ADMIN") redirect("/")

    const [costingData, config] = await Promise.all([
        getAllProductsCost(),
        serverFetch<any>('/settings/tenant-config').catch(() => ({}))
    ])

    const marginGood = config?.costingMarginGood ? Number(config.costingMarginGood) : 60
    const marginLow = config?.costingMarginLow ? Number(config.costingMarginLow) : 40

    return (
        <AdminPageWrapper
            title="Costeo y Márgenes"
            description="Analiza el costo de producción, margen de ganancia y punto de equilibrio"
        >
            <CostingClient data={costingData} marginGood={marginGood} marginLow={marginLow} />
        </AdminPageWrapper>
    )
}
