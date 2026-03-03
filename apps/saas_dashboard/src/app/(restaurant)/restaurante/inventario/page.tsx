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
    if (user.role !== "ADMIN") redirect("/")

    const [items, warehouses, alerts] = await Promise.all([
        getInventoryItems(),
        getWarehouses(),
        getLowStockAlerts(),
    ])

    return (
        <AdminPageWrapper
            title="Ingredientes"
            description="Gestiona los ingredientes e insumos de tu restaurante"
            actions={
                <Button asChild className="transition-all duration-200 hover:scale-[1.01] active:scale-[0.98]">
                    <Link href="/restaurante/inventario/nuevo">
                        <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                        Nuevo Ingrediente
                    </Link>
                </Button>
            }
        >
            <InventoryClient items={items} warehouses={warehouses} alerts={alerts} />
        </AdminPageWrapper>
    )
}
