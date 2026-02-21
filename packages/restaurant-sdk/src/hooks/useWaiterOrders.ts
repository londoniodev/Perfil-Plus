"use client"

import useSWR, { mutate } from 'swr'
import { useState } from 'react'
import type { Order, OrderItem } from '@alvarosky/database'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export interface WaiterOrder extends Order {
    total: number
    items: (OrderItem & {
        product: { name: string; price: number }
        modifiers: any[]
    })[]
}

export function useWaiterOrders(tenantId: string) {
    // Poll every 5 seconds for new orders
    const { data, error, isLoading } = useSWR<WaiterOrder[]>(
        tenantId ? `/api/${tenantId}/orders` : null,
        fetcher,
        { refreshInterval: 5000 }
    )

    const [isUpdating, setIsUpdating] = useState(false)

    const updateStatus = async (orderId: string, status: string) => {
        setIsUpdating(true)
        try {
            await fetch(`/api/${tenantId}/orders/${orderId}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status })
            })
            mutate(`/api/${tenantId}/orders`)
            return { success: true }
        } catch (e) {
            console.error(e)
            return { success: false, error: e }
        } finally {
            setIsUpdating(false)
        }
    }

    const deleteOrder = async (orderId: string) => {
        setIsUpdating(true)
        try {
            await fetch(`/api/${tenantId}/orders/${orderId}`, {
                method: 'DELETE'
            })
            mutate(`/api/${tenantId}/orders`)
            return { success: true }
        } catch (e) {
            console.error(e)
            return { success: false, error: e }
        } finally {
            setIsUpdating(false)
        }
    }

    return {
        orders: data || [],
        isLoading,
        isError: error,
        updateStatus,
        deleteOrder,
        isUpdating
    }
}
