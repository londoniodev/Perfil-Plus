import { redirect } from "next/navigation"
import { getSessionUser } from "@/lib/auth-server"
import { AdminPageWrapper } from "@alvarosky/ui"
import { getAllProductsCost } from "@/actions/admin/inventory"
import { CostingClient } from "@/components/inventory/CostingClient"

export default async function CostingPage() {
    const user = await getSessionUser()
    if (!user) redirect("/login")
    if (user.role !== "ADMIN") redirect("/")

    const costingData = await getAllProductsCost()

    return (
        <AdminPageWrapper
            title="Costeo y Márgenes"
            description="Analiza el costo de producción, margen de ganancia y punto de equilibrio"
        >
            <CostingClient data={costingData} />
        </AdminPageWrapper>
    )
}
