"use client"

import { useState, useEffect } from "react"
import { Order, OrderStatus } from "@/types/restaurant"
import { getAdminOrders, updateOrderStatus } from "@/lib/api"
import {
    AdminPageWrapper,
    Button,
    Badge,
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
    useToast
} from "@alvarosky/ui"
import { RefreshCw, Clock, Utensils, CheckCircle, Truck, AlertCircle } from "lucide-react"

const STATUS_GROUPS = {
    NEW: ['PENDING'] as OrderStatus[],
    COOKING: ['PROCESSING', 'PREPARING'] as OrderStatus[],
    READY: ['READY', 'SHIPPED'] as OrderStatus[],
    COMPLETED: ['DELIVERED', 'SERVED', 'CANCELLED', 'REFUNDED'] as OrderStatus[],
}

const ONLINE_PROVIDERS = ['BOLD', 'MERCADO_PAGO', 'MERCADOPAGO']

// ─── OrderCard (Module-scope to avoid re-creation on parent re-render) ───
function OrderCard({ order, onStatusChange }: { order: Order; onStatusChange: (orderId: string, newStatus: OrderStatus) => void }) {
    return (
        <Card className="mb-4 border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-base font-bold">#{order.orderNumber.split('-').pop()}</CardTitle>
                        <p className="text-xs text-muted-foreground">
                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <Badge variant={order.orderType === 'DELIVERY' ? 'secondary' : 'outline'}>
                            {order.orderType === 'DINE_IN' ? `Mesa ${order.tableNumber || '?'}` : order.orderType}
                        </Badge>
                        {order.paymentProvider && ONLINE_PROVIDERS.includes(order.paymentProvider) ? (
                            <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700 text-[10px] px-1.5">
                                💳 PAGADO
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="text-[10px] px-1.5 border-amber-400 text-amber-600">
                                Pago pendiente
                            </Badge>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-4 py-2 text-sm">
                <div className="space-y-1 mb-3">
                    {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between items-start">
                            <div className="flex-1">
                                <span className="font-medium">{item.quantity}x {item.productName}</span>
                                {item.variantName && <span className="text-xs text-muted-foreground ml-1">({item.variantName})</span>}
                                {item.modifiers && item.modifiers.length > 0 && (
                                    <div className="text-xs text-muted-foreground pl-4 border-l-2 border-muted mt-1">
                                        {item.modifiers.map((m, idx) => (
                                            <div key={idx}>+ {m.quantity}x {m.modifierName}</div>
                                        ))}
                                    </div>
                                )}
                                {item.notes && <div className="text-xs text-amber-600 italic mt-1">Note: {item.notes}</div>}
                            </div>
                        </div>
                    ))}
                </div>

                {(order.customerName || order.notes || (order.orderType === 'DELIVERY' && order.shippingData)) && (
                    <div className="bg-muted/30 p-2 rounded text-xs space-y-1">
                        {order.customerName && <p><strong>Cliente:</strong> {order.customerName}</p>}
                        {order.orderType === 'DELIVERY' && order.shippingData && (
                            <p><strong>Dir:</strong> {order.shippingData.address}, {order.shippingData.city}</p>
                        )}
                        {order.notes && <p className="text-amber-600 font-medium">Nota: {order.notes}</p>}
                    </div>
                )}
            </CardContent>
            <CardFooter className="p-2 bg-muted/20 flex gap-2 justify-end">
                {/* Acciones según Estado */}
                {(order.status === 'PENDING') && (
                    <div className="flex gap-2 w-full">
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => onStatusChange(order.id, 'CANCELLED')}
                            className="flex-1"
                        >
                            <AlertCircle className="w-4 h-4 mr-2" aria-hidden="true" /> Rechazar
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => onStatusChange(order.id, 'PREPARING')}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                            <Utensils className="w-4 h-4 mr-2" aria-hidden="true" /> Enviar a Cocina
                        </Button>
                    </div>
                )}
                {(order.status === 'APPROVED') && (
                    <Button size="sm" onClick={() => onStatusChange(order.id, 'PREPARING')} className="w-full">
                        <Utensils className="w-4 h-4 mr-2" aria-hidden="true" /> Enviar a Cocina
                    </Button>
                )}
                {(order.status === 'PREPARING' || order.status === 'PROCESSING') && (
                    <Button size="sm" onClick={() => onStatusChange(order.id, 'READY')} className="w-full bg-orange-600 hover:bg-orange-700">
                        <Clock className="w-4 h-4 mr-2" aria-hidden="true" /> Marcar Listo (Cocina)
                    </Button>
                )}
                {(order.status === 'READY') && order.orderType !== 'DELIVERY' && (
                    <Button size="sm" onClick={() => onStatusChange(order.id, 'SERVED')} className="w-full">
                        <Utensils className="w-4 h-4 mr-2" aria-hidden="true" />
                        Servido
                    </Button>
                )}
                {(order.status === 'READY') && order.orderType === 'DELIVERY' && (
                    <div className="w-full text-center text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-md px-3 py-2 font-medium">
                        <Truck className="w-4 h-4 inline mr-1" aria-hidden="true" />
                        Gestionar desde <strong>Despachos</strong>
                    </div>
                )}
            </CardFooter>
        </Card>
    )
}

export default function AdminOrdersPage() {
    const toast = useToast()
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
    const [mounted, setMounted] = useState(false)
    const [activeTab, setActiveTab] = useState<string>("NEW")

    const fetchOrders = async () => {
        try {
            // Fetch ONLY active orders + last 20 completed to save bandwidth/DB
            const data = await getAdminOrders(undefined, true)
            // Sort by creation date desc
            setOrders(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
            setLastUpdated(new Date())
        } catch (error) {
            console.error("Failed to fetch orders:", error)
            toast.error(
                "Error",
                "No se pudieron cargar los pedidos."
            )
        } finally {
            setLoading(false)
        }
    }

    // Initial Fetch & Polling
    useEffect(() => {
        setMounted(true)
        fetchOrders()
    }, [])

    const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
        try {
            // Optimistic Update
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))

            await updateOrderStatus(orderId, newStatus)

            toast.success(
                "Estado actualizado",
                `Orden actualizada a ${newStatus}`
            )
            // Refetch to be sure
            fetchOrders()
        } catch (error) {
            toast.error(
                "Error",
                "No se pudo actualizar el estado."
            )
            // Revert on error would be ideal, but fetchOrders cleans it up next poll
        }
    }

    const getGroupedOrders = (group: OrderStatus[]) => {
        return orders.filter(o => group.includes(o.status))
    }

    return (
        <AdminPageWrapper
            title="Comandas"
            description="Gestión en tiempo real de órdenes de cocina."
            actions={
                <div className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground hidden sm:inline-block">
                        Actualizado: {mounted ? lastUpdated.toLocaleTimeString() : '...'}
                    </span>
                    <Button variant="outline" size="sm" onClick={fetchOrders} disabled={loading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refrescar
                    </Button>
                </div>
            }
            className="h-[calc(100vh-2rem)]"
        >
            <Tabs defaultValue="NEW" value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                <div className="flex justify-center mb-8">
                    <TabsList>
                        <TabsTrigger value="NEW" className="gap-2">
                            Nuevos <Badge variant="secondary" className="hidden sm:inline-flex ml-1 px-1.5 min-w-5">{getGroupedOrders(STATUS_GROUPS.NEW).length}</Badge>
                        </TabsTrigger>
                        <TabsTrigger value="COOKING" className="gap-2">
                            Cocina <Badge variant="secondary" className="hidden sm:inline-flex ml-1 px-1.5 min-w-5">{getGroupedOrders(STATUS_GROUPS.COOKING).length}</Badge>
                        </TabsTrigger>
                        <TabsTrigger value="READY" className="gap-2">
                            Listos <Badge variant="secondary" className="hidden sm:inline-flex ml-1 px-1.5 min-w-5">{getGroupedOrders(STATUS_GROUPS.READY).length}</Badge>
                        </TabsTrigger>
                        <TabsTrigger value="COMPLETED" className="gap-2">
                            Hechos <Badge variant="secondary" className="hidden sm:inline-flex ml-1 px-1.5 min-w-5">{getGroupedOrders(STATUS_GROUPS.COMPLETED).length}</Badge>
                        </TabsTrigger>
                    </TabsList>
                </div>

                <div className="flex-1 overflow-y-auto pb-20">
                    <TabsContent value="NEW" className="h-full m-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {getGroupedOrders(STATUS_GROUPS.NEW).map(order => (
                                <OrderCard key={order.id} order={order} onStatusChange={handleStatusChange} />
                            ))}
                        </div>
                        {getGroupedOrders(STATUS_GROUPS.NEW).length === 0 && (
                            <div className="flex items-center justify-center p-12 text-muted-foreground bg-muted/20 border rounded-lg border-dashed">
                                Sin pedidos nuevos
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="COOKING" className="h-full m-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {getGroupedOrders(STATUS_GROUPS.COOKING).map(order => (
                                <OrderCard key={order.id} order={order} onStatusChange={handleStatusChange} />
                            ))}
                        </div>
                        {getGroupedOrders(STATUS_GROUPS.COOKING).length === 0 && (
                            <div className="flex items-center justify-center p-12 text-muted-foreground bg-muted/20 border rounded-lg border-dashed">
                                Nada preparándose
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="READY" className="h-full m-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {getGroupedOrders(STATUS_GROUPS.READY).map(order => (
                                <OrderCard key={order.id} order={order} onStatusChange={handleStatusChange} />
                            ))}
                        </div>
                        {getGroupedOrders(STATUS_GROUPS.READY).length === 0 && (
                            <div className="flex items-center justify-center p-12 text-muted-foreground bg-muted/20 border rounded-lg border-dashed">
                                No hay pedidos listos
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="COMPLETED" className="h-full m-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {getGroupedOrders(STATUS_GROUPS.COMPLETED).slice(0, 20).map(order => (
                                <OrderCard key={order.id} order={order} onStatusChange={handleStatusChange} />
                            ))}
                        </div>
                        {getGroupedOrders(STATUS_GROUPS.COMPLETED).length === 0 && (
                            <div className="flex items-center justify-center p-12 text-muted-foreground bg-muted/20 border rounded-lg border-dashed">
                                No hay pedidos completados hoy
                            </div>
                        )}
                    </TabsContent>
                </div>
            </Tabs>
        </AdminPageWrapper >
    )
}
