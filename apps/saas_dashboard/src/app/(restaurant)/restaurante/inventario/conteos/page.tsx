import { redirect } from "next/navigation"
import { getSessionUser } from "@/lib/auth-server"
import { AdminPageWrapper } from "@alvarosky/ui"
import { getInventoryCounts, getWarehouses } from "@/actions/admin/inventory"
import { InventoryCountsClient } from "@/components/inventory/InventoryCountsClient"

export default async function InventoryCountsPage() {
    const user = await getSessionUser()
    if (!user) redirect("/login")
    if (user.role !== "ADMIN" && user.role !== "SUPERADMIN") redirect("/")

    const [counts, warehouses] = await Promise.all([
        getInventoryCounts(),
        getWarehouses(),
    ])

    return (
        <AdminPageWrapper
            title="Conteo Físico"
            description="Valida el inventario real contra el sistema para detectar mermas y fugas"
        >
            <InventoryCountsClient counts={counts} warehouses={warehouses} />
        </AdminPageWrapper>
    )
}
