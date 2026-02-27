import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { getSessionUser } from "@/lib/auth-server"
import { getOrders } from "@/actions/admin/orders"
import { PriceDisplay, AdminPageWrapper, Badge } from "@alvarosky/ui"
import OrderStatusBadge from "@/components/admin/orders/OrderStatusBadge"

export const dynamic = "force-dynamic"

// Helper para deducir el tipo visual de la orden
function getOrderTypeBadge(order: any) {
    if (order.orderType === "DINE_IN") {
        return <Badge className="bg-orange-100 text-orange-800 border-none">Mesa 🍽️</Badge>
    }

    // Asumiendo que hasDigital checa si absolutamente todos los items digitales puros o mixtos.
    // La regla del negocio dice: Si todos los items son DIGITAL, "Digital", DINE_IN "Mesa", DELIVERY "Envío"
    const isDigitalOnly = order.items.length > 0 && order.items.every((i: any) => i.variant?.product?.productType === "DIGITAL")

    if (isDigitalOnly) {
        return <Badge className="bg-blue-100 text-blue-800 border-none">Digital ☁️</Badge>
    }

    return <Badge className="bg-indigo-100 text-indigo-800 border-none">Envío 🚚</Badge>
}

export default async function AdminOrdersPage() {
    // Autenticación de dashboard
    const user = await getSessionUser()
    if (!user) {
        redirect("/login")
    }

    // Resolviendo el tenantId insertado por el Edge Middleware / Proxy
    const headersList = await headers()
    const tenantId = headersList.get("x-tenant-id")

    if (!tenantId) {
        return (
            <AdminPageWrapper
                title="Gestión de Órdenes (OMS)"
                description="Administra los pedidos consolidados de Restaurante, Productos y Descargas Digitales."
            >
                <div className="p-4 bg-destructive/10 text-destructive rounded-md">
                    No se detectó el Tenant activo. Contacta a soporte técnico.
                </div>
            </AdminPageWrapper>
        )
    }

    // Obtención de Órdenes directamente de Prisma (Via Server Action)
    const orders = await getOrders(tenantId)

    return (
        <AdminPageWrapper
            title="Gestión de Órdenes (OMS)"
            description="Administra los pedidos consolidados de Restaurante, Productos y Descargas Digitales."
        >
            <div className="rounded-md border bg-card text-card-foreground shadow-sm overflow-hidden overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse min-w-[800px]">
                    <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
                        <tr>
                            <th className="py-3 px-4 font-semibold border-b">Orden</th>
                            <th className="py-3 px-4 font-semibold border-b">Cliente</th>
                            <th className="py-3 px-4 font-semibold border-b">Tipo</th>
                            <th className="py-3 px-4 font-semibold border-b">Total</th>
                            <th className="py-3 px-4 font-semibold border-b w-[220px]">Estado (Acciones)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-8 text-center text-muted-foreground">
                                    No hay órdenes registradas.
                                </td>
                            </tr>
                        ) : (
                            orders.map((order) => (
                                <tr key={order.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                    <td className="py-3 px-4 align-top">
                                        <div className="font-medium text-primary">#{order.orderNumber}</div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            {new Date(order.createdAt).toLocaleString("es-ES")}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 align-top">
                                        <div className="font-medium">{order.customerName || order.user?.name || "Invitado"}</div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            {order.customerPhone || order.user?.email || "Sin datos de contacto"}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 align-top">
                                        {getOrderTypeBadge(order)}
                                    </td>
                                    <td className="py-3 px-4 align-top font-bold">
                                        <PriceDisplay price={Number(order.totalAmount)} />
                                    </td>
                                    <td className="py-3 px-4 align-top">
                                        <OrderStatusBadge order={order} />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </AdminPageWrapper>
    )
}
