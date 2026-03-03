import { Tabs, TabsContent, TabsList, TabsTrigger, ScrollArea } from "@alvarosky/ui"
import { OrderCard } from "./OrderCard"
import type { WaiterOrder } from "@/types/waiter"

interface OrderListProps {
    orders: WaiterOrder[]
    onUpdateStatus: (id: string, status: string) => void
    onDelete: (id: string) => void
    isUpdating: boolean
}

export function OrderList({ orders, onUpdateStatus, onDelete, isUpdating }: OrderListProps) {
    const pendingOrders = orders.filter(o => o.status === 'PENDING')
    const kitchenOrders = orders.filter(o => o.status === 'KITCHEN')
    const readyOrders = orders.filter(o => o.status === 'READY')

    return (
        <Tabs defaultValue="all" className="w-full h-full flex flex-col">
            <div className="px-4 py-2 border-b bg-background sticky top-0 z-10">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all">Todas ({orders.length})</TabsTrigger>
                    <TabsTrigger value="pending">Pendientes ({pendingOrders.length})</TabsTrigger>
                    <TabsTrigger value="kitchen">Cocina ({kitchenOrders.length})</TabsTrigger>
                    <TabsTrigger value="ready">Listas ({readyOrders.length})</TabsTrigger>
                </TabsList>
            </div>

            <ScrollArea className="flex-1 p-4">
                <TabsContent value="all" className="mt-0 space-y-4">
                    {orders.length === 0 ? <p className="text-center text-muted-foreground py-10">No hay órdenes activas</p> :
                        orders.map(order => (
                            <OrderCard key={order.id} order={order} onUpdateStatus={onUpdateStatus} onDelete={onDelete} isUpdating={isUpdating} />
                        ))}
                </TabsContent>
                <TabsContent value="pending" className="mt-0 space-y-4">
                    {pendingOrders.length === 0 ? <p className="text-center text-muted-foreground py-10">No hay órdenes pendientes</p> :
                        pendingOrders.map(order => (
                            <OrderCard key={order.id} order={order} onUpdateStatus={onUpdateStatus} onDelete={onDelete} isUpdating={isUpdating} />
                        ))}
                </TabsContent>
                <TabsContent value="kitchen" className="mt-0 space-y-4">
                    {kitchenOrders.length === 0 ? <p className="text-center text-muted-foreground py-10">No hay órdenes en cocina</p> :
                        kitchenOrders.map(order => (
                            <OrderCard key={order.id} order={order} onUpdateStatus={onUpdateStatus} onDelete={onDelete} isUpdating={isUpdating} />
                        ))}
                </TabsContent>
                <TabsContent value="ready" className="mt-0 space-y-4">
                    {readyOrders.length === 0 ? <p className="text-center text-muted-foreground py-10">No hay órdenes listas</p> :
                        readyOrders.map(order => (
                            <OrderCard key={order.id} order={order} onUpdateStatus={onUpdateStatus} onDelete={onDelete} isUpdating={isUpdating} />
                        ))}
                </TabsContent>
            </ScrollArea>
        </Tabs>
    )
}
