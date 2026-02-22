"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AdminPageWrapper, Card, Badge, Button } from "@alvarosky/ui"
import { getAdminOrders } from "@/lib/api"
import { useOrderEvents } from "@/hooks/use-order-events"
import { getTables, Table } from "@/actions/admin/tables"
import { Order } from "@/types/restaurant"
import { Utensils, Users, Clock } from "lucide-react"

export default function POSPage() {
    const router = useRouter()
    const [tables, setTables] = useState<Table[]>([])
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)

    const fetchActiveOrders = async () => {
        try {
            const allOrders = await getAdminOrders()
            // Filter only active DINE_IN orders
            const active = allOrders.filter(o =>
                o.orderType === 'DINE_IN' &&
                ['PENDING', 'APPROVED', 'PREPARING', 'PROCESSING', 'READY', 'SERVED'].includes(o.status)
            )
            setOrders(active)
        } catch (error) {
            console.error("Error fetching orders:", error)
        } finally {
            setLoading(false)
        }
    }

    // Real-time updates via SSE
    useOrderEvents((event) => {
        if (event.type === 'new_order' || event.type === 'status_changed') {
            fetchActiveOrders()
        }
    })

    useEffect(() => {
        const fetchData = async () => {
            const [fetchedTables, _] = await Promise.all([
                getTables(),
                fetchActiveOrders()
            ])
            setTables(fetchedTables)
        }
        fetchData()
    }, [])

    const getTableStatus = (tableId: string) => {
        const order = orders.find(o => o.tableNumber === tableId)
        return order ? { status: 'occupied', order } : { status: 'free', order: null }
    }

    const handleTableClick = (tableId: string) => {
        router.push(`/admin/restaurant/pos/${tableId}`)
    }

    return (
        <AdminPageWrapper
            title="Punto de Venta (POS)"
            description="Selecciona una mesa para tomar un nuevo pedido o gestionar uno existente."
            actions={
                <div className="flex gap-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/20 px-3 py-1 rounded-full">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div> Libre
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/20 px-3 py-1 rounded-full">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div> Ocupada
                    </div>
                </div>
            }
        >
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {tables.map(table => {
                    const { status, order } = getTableStatus(table.id)
                    const isOccupied = status === 'occupied'

                    return (
                        <Card
                            key={table.id}
                            className={`cursor-pointer hover:scale-[1.02] transition-all duration-200 border-2 
                                ${isOccupied ? 'border-red-200 bg-red-50/50 hover:border-red-300' : 'border-green-200 bg-green-50/50 hover:border-green-300'}`}
                            onClick={() => handleTableClick(table.id)}
                        >
                            <div className="p-6 flex flex-col items-center justify-center min-h-[140px] text-center space-y-3">
                                <div className="relative">
                                    <h3 className={`text-2xl font-bold ${isOccupied ? 'text-red-700' : 'text-green-700'}`}>
                                        {table.label}
                                    </h3>
                                    {isOccupied && (
                                        <Badge variant="destructive" className="absolute -top-3 -right-6 text-[10px] px-1 h-5">
                                            #{order?.orderNumber.split('-').pop()}
                                        </Badge>
                                    )}
                                </div>

                                <div className="flex items-center gap-4 text-muted-foreground">
                                    <div className="flex items-center gap-1 text-xs">
                                        <Users className="w-3 h-3" />
                                        <span>{table.capacity}p</span>
                                    </div>
                                    {isOccupied && order && (
                                        <div className="flex items-center gap-1 text-xs text-red-600 font-medium">
                                            <Utensils className="w-3 h-3" />
                                            <span>{order.items.length} ítems</span>
                                        </div>
                                    )}
                                </div>

                                {isOccupied && order && (
                                    <div className="text-[10px] text-muted-foreground flex items-center gap-1 bg-white/50 px-2 py-0.5 rounded-full">
                                        <Clock className="w-3 h-3" />
                                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                )}

                                {!isOccupied && (
                                    <span className="text-xs text-green-600 font-medium bg-green-100/50 px-2 py-1 rounded-full">
                                        Disponible
                                    </span>
                                )}
                            </div>
                        </Card>
                    )
                })}
            </div>
        </AdminPageWrapper>
    )
}
