"use client"

import { OrdersTable } from "@alvarosky/ui"
import { updateOrderStatus } from "@/actions/admin/update-order-status"

interface OrdersTableClientProps {
    data: any[]
}

export function OrdersTableClient({ data }: OrdersTableClientProps) {

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        const result = await updateOrderStatus({
            orderId,
            status: newStatus as any
        })
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
