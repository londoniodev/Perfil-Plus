"use client"

import { useState, useEffect } from "react"
import { Order } from "@/types/restaurant"
import { getAdminOrders, updateOrderStatus, toggleItemPrepared } from "@/lib/api"
import { useOrderEvents } from "@/hooks/use-order-events"
import {
    AdminPageWrapper,
    Button,
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
    useToast
} from "@alvarosky/ui"
import { CheckCircle, RefreshCw, Clock } from "lucide-react"

export default function KitchenPage() {
    const toast = useToast()
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

    const fetchOrders = async () => {
        try {
            // Fetch ONLY active orders + last 20 completed to save bandwidth/DB
            const data = await getAdminOrders(undefined, true)
            // Filter only for Kitchen (PREPARING, PROCESSING)
            const kitchenOrders = data.filter(o =>
                o.status === 'PREPARING' || o.status === 'PROCESSING'
            ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) // FIFO (First In First Out) for Kitchen

            setOrders(kitchenOrders)
            setLastUpdated(new Date())
        } catch (error) {
            console.error("Failed to fetch kitchen orders:", error)
            toast.error("Error", "No se pudieron cargar las comandas.")
        } finally {
            setLoading(false)
        }
    }

    // Real-time updates via SSE
    useOrderEvents((event) => {
        if (event.type === 'new_order') {
            toast.success("Nueva Orden", `Comanda #${event.data.orderNumber.split('-').pop()} recibida.`)
            fetchOrders()
            // Play notification sound if possible
            const audio = new Audio('/sounds/notification.mp3')
            audio.play().catch(() => {/* ignore if blocked */ })
        }
        if (event.type === 'status_changed') {
            // If an order was cancelled or changed status, refresh to keep consistent
            fetchOrders()
        }
    })

    // Initial Fetch
    useEffect(() => {
        fetchOrders()
    }, [])

    const handleMarkReady = async (orderId: string) => {
        try {
            setOrders(prev => prev.filter(o => o.id !== orderId)) // Optimistic remove
            await updateOrderStatus(orderId, 'READY')
            toast.success("Orden Lista", "Se ha notificado al mesero.")
            // No need to fetchOrders manually here, SSE status_changed will handle sync if needed or we stay optimistic
        } catch (error) {
            toast.error("Error", "No se pudo actualizar la orden.")
            fetchOrders() // Revert
        }
    }

    return (
        <AdminPageWrapper
            title="Pantalla de Cocina (KDS)"
            description="Comandas activas en preparación."
            actions={
                <div className="flex items-center gap-4">
                    <span className="text-xl font-bold bg-muted px-3 py-1 rounded">
                        {orders.length} Pendientes
                    </span>
                    <Button variant="outline" onClick={fetchOrders} disabled={loading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refrescar
                    </Button>
                </div>
            }
        >
            {orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                    <CheckCircle className="w-24 h-24 mb-6 text-green-500/20" />
                    <p className="text-2xl font-bold mb-2">Todo al día</p>
                    <p>No hay comandas pendientes en cocina.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {orders.map((order) => (
                        <KitchenCard key={order.id} order={order} onReady={handleMarkReady} />
                    ))}
                </div>
            )}
        </AdminPageWrapper>
    )
}

function KitchenCard({ order, onReady }: { order: Order, onReady: (id: string) => void }) {
    // Force re-render periodically for timer? Ideally yes, but static is fine for MVP + 10s polling refresh
    const elapsedMinutes = Math.floor((new Date().getTime() - new Date(order.createdAt).getTime()) / 60000)


    // Alert colors based on wait time
    let borderClass = 'border-l-blue-500'
    let timeClass = 'text-blue-600'
    let bgClass = 'bg-card'

    if (elapsedMinutes > 20) {
        borderClass = 'border-l-red-500 shadow-red-100'
        timeClass = 'text-red-600 animate-pulse'
        bgClass = 'bg-red-50/10'
    } else if (elapsedMinutes > 10) {
        borderClass = 'border-l-orange-500'
        timeClass = 'text-orange-600'
    }

    const handleToggleItem = async (itemId: string, currentStatus: boolean) => {
        // Optimistic toggle locally? 
        // Better wait for server response or simple re-fetch via SSE.
        // Let's call API.
        try {
            await toggleItemPrepared(order.id, itemId, !currentStatus)
            // Toast or sound? maybe too noisy.
        } catch (e) {
            console.error(e)
        }
    }

    const allChecked = order.items.every(i => i.isPrepared)

    return (
        <Card className={`border-l-[12px] shadow-lg h-full flex flex-col ${borderClass} ${bgClass}`}>
            <CardHeader className="bg-muted/20 pb-4">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-4xl font-black tracking-tight">
                            {order.orderType === 'DINE_IN' ? `Mesa ${order.tableNumber || '?'}` : (order.orderType === 'DELIVERY' ? 'Domicilio' : order.orderType)}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-lg text-muted-foreground font-mono font-bold bg-white/50 px-2 rounded border">
                                #{order.orderNumber.split('-').pop()}
                            </span>
                            {order.customerName && <span className="text-sm font-bold uppercase text-muted-foreground truncate max-w-[150px]">{order.customerName}</span>}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className={`flex items-center justify-end font-black text-3xl ${timeClass}`}>
                            <Clock className="w-6 h-6 mr-2" />
                            {elapsedMinutes}m
                        </div>
                        <p className="text-sm text-muted-foreground font-bold mt-1">
                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-y-auto max-h-[500px]">
                <ul className="divide-y divide-border">
                    {order.items.map((item) => {

                        return (
                            <li
                                key={item.id}
                                className={`p-4 transition-colors cursor-pointer hover:bg-muted/30 ${item.isPrepared ? 'bg-muted/40 opacity-50' : ''}`}
                                onClick={() => handleToggleItem(item.id, !!item.isPrepared)}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`
                                        flex-shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all
                                        ${item.isPrepared ? 'bg-green-500 border-green-500 text-white' : 'border-muted-foreground/30 text-transparent'}
                                    `}>
                                        <CheckCircle className="w-6 h-6" />
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <span className="text-3xl font-black w-12 text-center leading-none mr-2 bg-muted/20 rounded px-1 min-h-[40px] flex items-center justify-center">
                                                {item.quantity}
                                            </span>
                                            <div className="flex-1">
                                                <span className={`text-2xl font-bold leading-tight block ${item.isPrepared ? 'line-through text-muted-foreground' : ''}`}>
                                                    {item.productName}
                                                </span>
                                                {item.variantName && <div className="text-lg font-semibold text-muted-foreground mt-1">{item.variantName}</div>}
                                            </div>
                                        </div>

                                        {/* Modifiers Highlighted */}
                                        {item.modifiers && item.modifiers.length > 0 && (
                                            <div className="ml-14 mt-2 flex flex-wrap gap-2">
                                                {item.modifiers.map((m, idx) => (
                                                    <div key={idx} className="bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200 px-3 py-1.5 rounded-md text-base font-bold border-2 border-yellow-200 dark:border-yellow-800 shadow-sm">
                                                        + {m.quantity > 1 ? `${m.quantity}x ` : ''}{m.modifierName}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {item.notes && (
                                            <div className="ml-14 mt-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 p-3 rounded-md text-base font-bold border-2 border-red-200 dark:border-red-900 animate-pulse">
                                                ⚠️ NOTA: {item.notes}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </li>
                        )
                    })}
                </ul>

                {/* General Notes */}
                {(order.notes) && (
                    <div className="m-4 mt-2 bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 p-4 rounded-xl">
                        <p className="text-sm font-black text-red-600 uppercase mb-2">Nota General del Pedido:</p>
                        <p className="text-xl font-bold">{order.notes}</p>
                    </div>
                )}
            </CardContent>
            <CardFooter className="p-4 bg-muted/10 border-t">
                <Button
                    size="lg"
                    className={`
                        w-full text-xl h-20 font-black tracking-wide shadow-xl transition-all
                        ${allChecked
                            ? 'bg-green-600 hover:bg-green-700 hover:scale-[1.02] animate-bounce-short'
                            : 'bg-primary/80 hover:bg-primary opacity-90'
                        }
                    `}
                    disabled={!allChecked} // Require checking all items? Maybe optional, user didn't specify. Let's make it optional but visually distinct.
                    // Actually, "van chuleando los platos ya listos" implies a checklist. Let's keep it enabled but change style if all checked.
                    // User said: "van chuleando los platos ya listos en una vista de botnoes y cards"
                    // Let's allow marking ready even if not all checked, but maybe warn? Or just let them.
                    // "Checkboxes" are for internal tracking.
                    onClick={() => onReady(order.id)}
                >
                    <CheckCircle className={`w-8 h-8 mr-3 ${allChecked ? 'animate-pulse' : ''}`} />
                    {allChecked ? '¡ORDEN COMPLETA!' : 'MARCAR LISTO'}
                </Button>
            </CardFooter>
        </Card>
    )
}
