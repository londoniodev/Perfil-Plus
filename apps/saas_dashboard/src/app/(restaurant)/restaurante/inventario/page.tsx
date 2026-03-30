import { redirect } from "next/navigation"
import Link from "next/link"
import { getSessionUser } from "@/lib/auth-server"
import { Button, AdminPageWrapper } from "@alvarosky/ui"
import { Plus } from "lucide-react"
import { getInventoryItems, getWarehouses, getLowStockAlerts } from "@/actions/admin/inventory"
import { InventoryClient } from "@/components/inventory/InventoryClient"

export default async function InventoryItemsPage() {
    const user = await getSessionUser()
    if (!user) redirect("/login")
    if (user.role !== "ADMIN" && user.role !== "SUPERADMIN") redirect("/")

    const [items, warehouses, alerts] = await Promise.all([
        getInventoryItems(),
        getWarehouses(),
        getLowStockAlerts(),
    ])

    return (
        <AdminPageWrapper
            title="Ingredientes"
            description="Gestiona los ingredientes e insumos de tu restaurante"
        >
            <InventoryClient items={items} warehouses={warehouses} alerts={alerts} />
        </AdminPageWrapper>
    )
}
