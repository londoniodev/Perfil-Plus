import { Card, CardContent, CardFooter, CardHeader, CardTitle, Badge, Button, Separator } from "@alvarosky/ui"
import { Clock, CheckCircle2, XCircle, ChevronRight, Utensils } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import type { WaiterOrder } from "@/types/waiter"
import { formatCurrency } from "@/lib/utils"

interface OrderCardProps {
    order: WaiterOrder
    onUpdateStatus: (id: string, status: string) => void
    onDelete: (id: string) => void
    isUpdating: boolean
}

export function OrderCard({ order, onUpdateStatus, onDelete, isUpdating }: OrderCardProps) {
    const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
        PENDING: "secondary",
        APPROVED: "secondary",
        KITCHEN: "default",
        READY: "outline",
        COMPLETED: "outline",
        CANCELLED: "destructive",
    }

    const nextStatus: Record<string, string> = {
        PENDING: "KITCHEN",
        APPROVED: "KITCHEN",
        KITCHEN: "READY",
        READY: "COMPLETED",
    }

    const statusLabels: Record<string, string> = {
        PENDING: "Pendiente",
        APPROVED: "Pagado (Pendiente)",
        KITCHEN: "En Cocina",
        READY: "Listo",
        COMPLETED: "Completado",
        CANCELLED: "Cancelado",
    }

    return (
        <Card className="w-full relative overflow-hidden border-l-8 border-l-primary">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-xl flex items-center gap-2">
                            Mesa {(order as any).tableId || (order as any).tableNumber || "N/A"}
                            {order.status === 'APPROVED' && (
                                <Badge className="bg-green-500 hover:bg-green-600 ml-2">Pagado (MercadoPago)</Badge>
                            )}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1 font-mono">#{order.id.slice(-4)} • {order.customerName}</p>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true, locale: es })}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pb-2">
                <div className="space-y-1">
                    {order.items.map((item, idx) => (
                        <div key={idx} className="flex flex-col text-base mb-2">
                            <div className="flex justify-between w-full">
                                <span className="flex gap-2">
                                    <span className="font-bold w-6 text-center">{item.quantity}x</span>
                                    <span className="font-bold leading-tight">{item.productName || "Producto"}</span>
                                </span>
                                <span className="text-muted-foreground ml-2">{formatCurrency(Number(item.price) * item.quantity)}</span>
                            </div>
                            {item.modifiers && item.modifiers.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1 pl-8">
                                    {item.modifiers.map((m, mIdx) => (
                                        <span key={mIdx} className="bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200 px-2 py-0.5 rounded text-xs font-bold">
                                            +{m.quantity > 1 ? `${m.quantity}x ` : ''}{m.modifierName}
                                        </span>
                                    ))}
                                </div>
                            )}
                            {item.notes && (
                                <span className="text-sm font-semibold text-red-600 bg-red-100 dark:bg-red-900/40 px-2 py-0.5 rounded mt-1 ml-8 w-fit">
                                    Nota: {item.notes}
                                </span>
                            )}
                        </div>
                    ))}
                    {order.notes && (
                        <div className="mt-2 text-xs bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 p-2 rounded">
                            {order.notes.split('\n').filter(Boolean).map((line, i) => (
                                <span key={i} className={line.includes('Forma de pago:') ? 'font-semibold flex items-center gap-1 not-italic mt-1' : 'italic block'}>
                                    {line}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
                <Separator className="my-3" />
                <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{formatCurrency(Number((order as any).totalAmount || (order as any).total || 0))}</span>
                </div>
            </CardContent>
            <CardFooter className="pt-2 flex w-full gap-2">
                {order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
                    <>
                        {order.status === 'PENDING' && (
                            <Button
                                variant="destructive"
                                size="lg"
                                className="flex-1 font-bold"
                                onClick={() => {
                                    if (confirm("¿Estás seguro de cancelar esta orden?")) {
                                        onDelete(order.id)
                                    }
                                }}
                                disabled={isUpdating}
                            >
                                <XCircle className="w-4 h-4 mr-1" /> Cancelar
                            </Button>
                        )}

                        {nextStatus[order.status] && (
                            <Button
                                size="lg"
                                onClick={() => onUpdateStatus(order.id, nextStatus[order.status])}
                                disabled={isUpdating}
                                className={`flex-1 font-bold shadow-none ring-0 focus:ring-0 ${(order.status === 'PENDING' || order.status === 'APPROVED') ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                            >
                                {(order.status === 'PENDING' || order.status === 'APPROVED') ? <><Utensils className="w-4 h-4 mr-2" /> A Cocina</> :
                                    order.status === 'KITCHEN' ? <><CheckCircle2 className="w-4 h-4 mr-2" /> Marcar Listo</> :
                                        <><CheckCircle2 className="w-4 h-4 mr-2" /> Servido</>}
                            </Button>
                        )}
                    </>
                )}
            </CardFooter>
        </Card>
    )
}
