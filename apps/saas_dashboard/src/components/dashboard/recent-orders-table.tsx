import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@alvarosky/ui"

const STATUS_MAP: Record<string, { label: string; className: string }> = {
    PENDING: {
        label: "Pendiente",
        className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    },
    APPROVED: {
        label: "Aprobado",
        className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    },
    PREPARING: {
        label: "En Cocina",
        className: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    },
    READY: {
        label: "Listo",
        className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
    },
    SERVED: {
        label: "Servido",
        className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    },
    DELIVERED: {
        label: "Entregado",
        className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    },
    CANCELLED: {
        label: "Cancelado",
        className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    },
}

const ORDER_TYPE_LABELS: Record<string, string> = {
    DINE_IN: "Mesa",
    TAKE_AWAY: "Llevar",
    DELIVERY: "Domicilio",
}

export interface RecentOrderData {
    id: string
    orderNumber: string
    customerName: string | null
    totalAmount: number
    status: string
    orderType: string
    tableNumber: string | null
    createdAt: string
    itemCount: number
}

interface RecentOrdersTableProps {
    data: RecentOrderData[]
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value)
}

function formatTime(dateStr: string): string {
    const date = new Date(dateStr)
    return date.toLocaleTimeString("es-CO", {
        hour: "2-digit",
        minute: "2-digit",
    })
}

export function RecentOrdersTable({ data }: RecentOrdersTableProps) {
    const hasData = data.length > 0

    return (
        <Card className="border-border/50 bg-card/60 backdrop-blur-xl">
            <CardHeader className="pb-3">
                <CardTitle className="text-base">Últimas Órdenes</CardTitle>
                <CardDescription>Actividad reciente del restaurante</CardDescription>
            </CardHeader>
            <CardContent className="px-0 sm:px-6">
                {hasData ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border/50">
                                    <th className="text-left font-medium text-muted-foreground px-4 py-2">
                                        Orden
                                    </th>
                                    <th className="text-left font-medium text-muted-foreground px-4 py-2 hidden sm:table-cell">
                                        Cliente
                                    </th>
                                    <th className="text-left font-medium text-muted-foreground px-4 py-2">
                                        Tipo
                                    </th>
                                    <th className="text-left font-medium text-muted-foreground px-4 py-2">
                                        Estado
                                    </th>
                                    <th className="text-right font-medium text-muted-foreground px-4 py-2">
                                        Total
                                    </th>
                                    <th className="text-right font-medium text-muted-foreground px-4 py-2 hidden md:table-cell">
                                        Hora
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((order) => {
                                    const statusInfo = STATUS_MAP[order.status] || {
                                        label: order.status,
                                        className: "bg-gray-100 text-gray-800",
                                    }

                                    return (
                                        <tr
                                            key={order.id}
                                            className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors"
                                        >
                                            <td className="px-4 py-3">
                                                <div className="font-mono font-semibold text-foreground">
                                                    #{order.orderNumber}
                                                </div>
                                                <div className="text-xs text-muted-foreground mt-0.5">
                                                    {order.itemCount} {order.itemCount === 1 ? "item" : "items"}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 hidden sm:table-cell">
                                                <span className="text-foreground">
                                                    {order.customerName || "—"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                                                    {ORDER_TYPE_LABELS[order.orderType] || order.orderType}
                                                    {order.tableNumber && (
                                                        <span className="ml-1 text-primary font-bold">
                                                            · M{order.tableNumber}
                                                        </span>
                                                    )}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${statusInfo.className}`}
                                                >
                                                    {statusInfo.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <span className="font-semibold text-foreground">
                                                    {formatCurrency(order.totalAmount)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right hidden md:table-cell">
                                                <span className="text-xs text-muted-foreground">
                                                    {formatTime(order.createdAt)}
                                                </span>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-[200px] bg-card/40 rounded-xl border border-dashed border-border/50 mx-4 sm:mx-0">
                        <p className="text-sm text-muted-foreground">
                            No hay órdenes recientes
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
