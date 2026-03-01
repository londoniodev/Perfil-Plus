"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter, useSearchParams, usePathname } from "next/navigation"

import { TENANT_ID } from "@/lib/config"
import { getAdminOrders, updateOrderStatus } from "@/lib/api"
import { AdminPageWrapper, Button, Badge, Separator, Card, CardContent, CardFooter, CardHeader, CardTitle } from "@alvarosky/ui"
import { Clock, CheckCircle2, Utensils, RefreshCw, ChefHat, Loader2, Play } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

import type { WaiterOrder } from "@/types/waiter"
import type { Table } from "@/actions/admin/tables"
import { useOrderEvents } from "@/hooks/use-order-events"

// ─── KitchenCard ──────────────────────────────────────────────────────
function KitchenCard({ order, onAction, busy, tableName }: {
    order: WaiterOrder
    onAction: (id: string, status: string) => void
    busy: boolean
    tableName?: string
}) {
    const nextAction: Record<string, { label: string; icon: React.ReactNode; status: string; color: string }> = {
        APPROVED: { label: "Empezar", icon: <Play className="w-4 h-4" />, status: "PREPARING", color: "bg-blue-600 hover:bg-blue-700" },
        PREPARING: { label: "Listo", icon: <CheckCircle2 className="w-4 h-4" />, status: "READY", color: "bg-green-600 hover:bg-green-700 text-white shadow-none ring-0 focus:ring-0" },
    }

    const action = nextAction[order.status]
    const isReady = order.status === "READY"

    return (
        <Card className="w-full overflow-hidden border-l-8 border-l-primary transition-shadow hover:shadow-lg">
            <CardHeader className="pb-2 px-4 pt-4 bg-muted/10">
                <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                        <CardTitle className="text-xl flex items-center gap-2 flex-wrap font-black tracking-tight">
                            {tableName || (order.tableNumber ? `Mesa ${order.tableNumber}` : (order.orderType === 'DELIVERY' ? 'Domicilio' : "Llevar"))}
                            <Badge variant="secondary" className="text-sm font-mono tracking-wider text-muted-foreground">
                                #{order.orderNumber || order.id.slice(-6)}
                            </Badge>
                        </CardTitle>
                        {order.customerName && (
                            <p className="text-sm text-muted-foreground mt-1 font-semibold flex items-center gap-1">
                                {order.customerName}
                            </p>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="px-5 py-4 flex-1">
                <div className="space-y-3 text-base">
                    {order.items.map((item, i) => (
                        <div key={i} className="flex items-start gap-3">
                            <span className="text-xl font-black w-8 bg-muted text-center rounded pt-0.5">{item.quantity}</span>
                            <div className="flex flex-col">
                                <span className="font-bold text-lg leading-tight">{item.productName}</span>
                                {item.modifiers && item.modifiers.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {item.modifiers.map((m, idx) => (
                                            <span key={idx} className="bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200 px-2 py-0.5 rounded text-xs font-bold">
                                                +{m.quantity > 1 ? `${m.quantity}x ` : ''}{m.modifierName}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                {item.notes && (
                                    <span className="text-sm font-semibold text-red-600 bg-red-100 dark:bg-red-900/40 px-2 py-0.5 rounded mt-1">
                                        Nota: {item.notes}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {order.notes && (
                    <div className="mt-3 text-sm bg-yellow-500/10 text-yellow-600 p-2 rounded">
                        {order.notes.split('\n').filter(Boolean).map((line, i) => (
                            <span key={i} className={line.includes('Forma de pago:') ? 'font-semibold flex items-center gap-1 not-italic mt-1' : 'italic block'}>
                                {line}
                            </span>
                        ))}
                    </div>
                )}
            </CardContent>

            <CardFooter className="px-4 pb-4 pt-2 flex flex-col gap-3 items-stretch justify-between border-t bg-muted/10">
                <div className="flex items-center justify-center w-full text-sm font-bold text-muted-foreground bg-white/50 dark:bg-black/50 px-3 py-1.5 rounded-md">
                    <Clock className="w-4 h-4 mr-1.5" />
                    {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true, locale: es })}
                </div>
                {action && (
                    <Button size="lg" disabled={busy} className={`${action.color} font-bold text-md w-full px-8 transition-transform active:scale-95`}
                        onClick={() => onAction(order.id, action.status)}>
                        {action.icon} <span className="ml-2">{action.label}</span>
                    </Button>
                )}
                {isReady && (
                    <div className="text-sm font-bold text-emerald-600 flex items-center h-10">
                        <CheckCircle2 className="w-5 h-5 mr-1" /> Lista para recoger
                    </div>
                )}
            </CardFooter>
        </Card>
    )
}

// ─── Main Kitchen Client ─────────────────────────────────────────────
export function KitchenClient({ initialTables = [] }: { initialTables?: Table[] }) {
    const { user, isAdmin, loading: authLoading } = useAuth()
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const tab = searchParams?.get("tab") || "active"

    const [orders, setOrders] = useState<WaiterOrder[]>([])
    const [loading, setLoading] = useState(true)
    const [busy, setBusy] = useState(false)

    const fetchOrders = useCallback(async () => {
        try {
            const data = await getAdminOrders(undefined, true);
            // Cocina solo ve APPROVED, PREPARING
            const kitchenOrders = data.filter((o: any) => ["APPROVED", "PREPARING"].includes(o.status));
            // Sort por antigüedad
            kitchenOrders.sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

            setOrders(kitchenOrders as any)
        } catch (e) {
            console.error("Fetch error details:", e);
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchOrders()
    }, [fetchOrders])

    useOrderEvents((event) => {
        fetchOrders()
        if (event.type === 'new_order' || event.type === 'status_changed') {
            const audio = new Audio('/sounds/notification.mp3')
            audio.play().catch(() => {/* ignore if blocked */ })
        }
    })

    const handleAction = async (orderId: string, status: string) => {
        setBusy(true)
        try {
            await updateOrderStatus(orderId, status as any);
            await fetchOrders()
        } catch (e: any) {
            console.error(e)
            alert(`Error: ${e.message}`)
        } finally {
            setBusy(false)
        }
    }

    const tableMap = new Map(initialTables.map(t => [t.id, t.label]))

    // ── Derived data ──
    const approved = orders.filter(o => o.status === "APPROVED")
    const preparing = orders.filter(o => o.status === "PREPARING")
    const active = [...approved, ...preparing] // All for "Activas" tab

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!isAdmin && user?.role !== "KITCHEN" && user?.role !== "WAITER") {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <p className="text-destructive font-medium">No tienes acceso a esta vista.</p>
            </div>
        )
    }

    const renderList = (list: WaiterOrder[], empty: string) =>
        list.length === 0
            ? <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-muted/20 rounded-xl border-2 border-dashed">
                <Utensils className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-xl font-bold text-center px-4">{empty}</p>
            </div>
            : <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{list.map(o => (
                <KitchenCard
                    key={o.id}
                    order={o}
                    onAction={handleAction}
                    busy={busy}
                    tableName={o.tableNumber ? tableMap.get(o.tableNumber) : undefined}
                />
            ))}</div>

    return (
        <AdminPageWrapper
            title="KDS — Cocina"
            description="Panel Maestro de Control de Comandas"
            actions={
                <div className="flex gap-2">
                    <Button variant="outline" size="lg" onClick={() => { setLoading(true); fetchOrders() }} className="font-bold shadow-sm">
                        <RefreshCw className="w-5 h-5 mr-2" /> Actualizar
                    </Button>
                </div>
            }
        >

            {renderList(active, "No hay comandas activas en la cocina")}
        </AdminPageWrapper>
    )
}
