import { redirect } from "next/navigation"
import { getSessionUser } from "@/lib/auth-server"
import { AdminPageWrapper } from "@alvarosky/ui"
import { getWarehouses } from "@/actions/admin/inventory"
import { WarehousesClient } from "@/components/inventory/WarehousesClient"

export default async function WarehousesPage() {
    const user = await getSessionUser()
    if (!user) redirect("/login")
    if (user.role !== "ADMIN") redirect("/")

    const warehouses = await getWarehouses()

    return (
        <AdminPageWrapper
            title="Almacenes"
            description="Configura los puntos de almacenamiento (cocina, bar, bodega)"
        >
            <WarehousesClient warehouses={warehouses} />
        </AdminPageWrapper>
    )
}
