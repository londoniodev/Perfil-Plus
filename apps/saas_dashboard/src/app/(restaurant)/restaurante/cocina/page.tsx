import { KitchenClient } from "@/components/kitchen/KitchenClient"
import { getTables } from "@/actions/admin/tables"

export default async function KitchenPage() {
    // Si la cocina también necesita nombres de mesas (probablemente sí, para mayor claridad)
    const tables = await getTables()
    return <KitchenClient initialTables={tables} />
}
