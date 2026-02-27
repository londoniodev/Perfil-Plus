"use client"

import { OrdersTable } from "@alvarosky/ui"
import { updateOrderStatus } from "@/actions/admin/orders"

export function OrdersTableClient({ data }: { data: any[] }) {

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        const result = await updateOrderStatus(orderId, newStatus as any)
        return {
            success: result.success,
            error: result.error
        }
    }

    return (
        <OrdersTable
            orders={data}
            onStatusChange={handleStatusChange}
        />
    )
}
