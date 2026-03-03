import { WaiterClient } from "@/components/waiter/WaiterClient"
import { getTables } from "@/actions/admin/tables"

export default async function WaiterPage() {
    const tables = await getTables()
    return <WaiterClient initialTables={tables} />
}
