"use client"

import { useState, useEffect, useCallback } from "react"
import { Order, OrderStatus } from "@/types/restaurant"
import { getAdminOrders, updateOrderStatus } from "@/lib/api"
import { useOrderEvents, OrderEvent } from "@/hooks/use-order-events"
import {
    AdminPageWrapper,
    Button,
    Badge,
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
    useToast
} from "@alvarosky/ui"
import { RefreshCw, MapPin, Truck, CheckCircle } from "lucide-react"
import { AssignDriverModal } from "@/components/admin/orders/AssignDriverModal"
import { DriverActiveRoute } from "@/components/admin/orders/DriverActiveRoute"

const ONLINE_PROVIDERS = ['BOLD', 'MERCADO_PAGO', 'MERCADOPAGO']

// ─── DispatchCard (Module-scope to avoid re-creation on parent re-render) ───
function DispatchCard({ order, onStatusChange }: { order: Order; onStatusChange: (orderId: string, newStatus: OrderStatus) => void }) {
    const isTransiting = order.status === 'ASSIGNED' || order.status === 'IN_TRANSIT';

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
                        <Badge variant={isTransiting ? "default" : "secondary"}>
                            {order.status === 'READY' ? 'Listo' : order.status}
                        </Badge>
                        {order.paymentProvider && ONLINE_PROVIDERS.includes(order.paymentProvider) ? (
                            <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700 text-[10px] px-1.5 flex items-center gap-1">
                                <CreditCard className="w-3 h-3" /> PAGADO
                            </Badge>
                        ) : (
                            <Badge variant="outline" className="text-[10px] px-1.5 border-amber-400 text-amber-600">
                                Cobrar al entregar
                            </Badge>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-4 py-2 text-sm">
                <div className="bg-muted/30 p-2 rounded text-xs space-y-1">
                    {order.customerName && <p><strong>Cliente:</strong> {order.customerName}</p>}
                    {order.shippingData && (
                        <p><strong>Dir:</strong> {order.shippingData.address}, {order.shippingData.city}</p>
                    )}
                    {order.notes && <p className="text-amber-600 font-medium">Nota: {order.notes}</p>}
                </div>
                
                {isTransiting && order.driver && (
                    <div className="mt-2 p-2 bg-blue-50/50 border border-blue-100 rounded text-xs text-blue-900 mt-3">
                        <div className="flex items-center gap-2 font-medium">
                            <Truck className="w-4 h-4" aria-hidden="true"/>
                            Repartidor Asignado:
                        </div>
                        <p className="mt-1">{order.driver.user?.name} - {order.driver.vehicle || 'Sin Vehículo'}</p>
                    </div>
                )}
            </CardContent>
            <CardFooter className="p-2 bg-muted/20 flex flex-col gap-2">
                {order.status === 'READY' && (
                    <AssignDriverModal orderId={order.id} />
                )}
                {isTransiting && (
                    <Button 
                        size="sm" 
                        variant="secondary" 
                        onClick={() => onStatusChange(order.id, 'DELIVERED')} 
                        className="w-full border shadow-sm mt-2 font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200"
                    >
                        <CheckCircle className="w-4 h-4 mr-2" aria-hidden="true" /> Marcar Entregado
                    </Button>
                )}
            </CardFooter>
        </Card>
    )
}

export default function DespachosBoard() {
    const toast = useToast()
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

    const fetchOrders = useCallback(async () => {
        try {
            const data = await getAdminOrders(undefined, true)
            // Filtrar solo las de tipo DELIVERY y que estén READY, ASSIGNED, o IN_TRANSIT
            const validStatuses = ['READY', 'ASSIGNED', 'IN_TRANSIT'];
            const displayOrders = data
                .filter(o => o.orderType === 'DELIVERY' && validStatuses.includes(o.status))
                .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                
            setOrders(displayOrders)
            setLastUpdated(new Date())
        } catch (error) {
            console.error("Failed to fetch orders:", error)
            toast.error("Error", "No se pudieron cargar los despachos.")
        } finally {
            setLoading(false)
        }
    }, [toast]);

    useEffect(() => {
        fetchOrders()
    }, [fetchOrders])

    useOrderEvents(
        useCallback(
            (event: OrderEvent) => {
                if (event.type === 'status_changed' || event.type === 'driver_assigned' || event.type === 'new_order') {
                    // Refetch al detectar cambios o asignaciones por otros cajeros/drivers
                    fetchOrders()
                }
            },
            [fetchOrders]
        )
    )

    const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
        try {
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
            await updateOrderStatus(orderId, newStatus)
            toast.success("Estado actualizado", `Orden actualizada a ${newStatus}`)
            fetchOrders()
        } catch (error) {
            toast.error("Error", "No se pudo actualizar el estado.")
            fetchOrders()
        }
    }

    const readyOrders = orders.filter(o => o.status === 'READY')
    const inTransitOrders = orders.filter(o => ['ASSIGNED', 'IN_TRANSIT'].includes(o.status))

    // Agrupamos las órdenes en tránsito por Domiciliario para el botón de Mapas
    const ordersByDriver = inTransitOrders.reduce((acc, order) => {
        const driverId = order.driverId;
        if (driverId && order.driver) {
            if (!acc[driverId]) acc[driverId] = { driver: order.driver, orders: [] };
            acc[driverId].orders.push(order);
        }
        return acc;
    }, {} as Record<string, { driver: any, orders: any[] }>);

    return (
        <AdminPageWrapper
            title="Despachos y Logística"
            description="Asignación y monitoreo de repartidores locales."
            actions={
                <div className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground hidden sm:inline-block">
                        Actualizado: {lastUpdated.toLocaleTimeString()}
                    </span>
                    <Button variant="outline" size="sm" onClick={fetchOrders} disabled={loading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
                        Refrescar
                    </Button>
                </div>
            }
            className="h-[calc(100vh-2rem)]"
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full overflow-hidden pb-10">
                {/* Columna: Listos para Despacho */}
                <div className="flex flex-col h-full bg-muted/10 rounded-xl p-4 border border-border/40 shadow-sm">
                    <h2 className="text-lg font-bold flex items-center mb-4">
                        <Badge variant="secondary" className="mr-2 px-2 py-0.5">{readyOrders.length}</Badge> Listos para Despacho
                    </h2>
                    <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                        {readyOrders.length === 0 ? (
                            <div className="flex items-center justify-center p-12 text-muted-foreground bg-background border border-border/40 rounded-lg border-dashed">
                                Sin pedidos listos
                            </div>
                        ) : (
                            readyOrders.map(order => (
                                <DispatchCard key={order.id} order={order} onStatusChange={handleStatusChange} />
                            ))
                        )}
                    </div>
                </div>

                {/* Columna: En Tránsito */}
                <div className="flex flex-col h-full bg-blue-50/20 rounded-xl p-4 border border-border/40 shadow-sm">
                    <h2 className="text-lg font-bold flex items-center mb-4 text-blue-900">
                        <Badge variant="default" className="mr-2 px-2 py-0.5 bg-blue-600 hover:bg-blue-700">{inTransitOrders.length}</Badge> En Tránsito
                    </h2>
                    <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                        {inTransitOrders.length === 0 ? (
                            <div className="flex items-center justify-center p-12 text-muted-foreground bg-background border border-border/40 rounded-lg border-dashed">
                                Sin despachos activos
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Componente de Ruta por cada Domiciliario activo */}
                                {Object.values(ordersByDriver).map(({ driver, orders }: any) => (
                                    <div key={driver.id} className="bg-background rounded-lg border border-border/40 shadow-sm overflow-hidden">
                                        <div className="bg-blue-100/50 p-3 border-b flex justify-between items-center">
                                            <div>
                                                <h3 className="font-semibold text-sm text-blue-900">{driver.user?.name}</h3>
                                                <span className="text-xs text-blue-700">{driver.vehicle} • {orders.length} pedidos a bordo</span>
                                            </div>
                                            <Badge variant="outline" className="bg-blue-50 border-blue-200">En Ruta</Badge>
                                        </div>
                                        <div className="p-3">
                                            {orders.map((o: any) => (
                                                <DispatchCard key={o.id} order={o} onStatusChange={handleStatusChange} />
                                            ))}
                                            {orders.length > 0 && (
                                                <DriverActiveRoute driver={driver} orders={orders} />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminPageWrapper>
    )
}
