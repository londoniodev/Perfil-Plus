"use client"

import { useState, useEffect, useCallback } from "react"
import { useTenant } from "@/app/providers";
import { useAuth } from "@/context/AuthContext"
import { useRouter, useSearchParams, usePathname } from "next/navigation"

import {} from "@/lib/config"
import { getAdminOrders, updateOrderStatus } from "@/lib/api"
import { Button, Badge, Separator, Card, CardContent, CardFooter, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger, ScrollArea, AdminPageWrapper } from "@alvarosky/ui"
import { Clock, CheckCircle2, XCircle, Utensils, Plus, RefreshCw, ChefHat, Bell, Loader2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

import type { WaiterOrder } from "@/types/waiter"
import type { Table } from "@/actions/admin/tables"
import { useOrderEvents } from "@/hooks/use-order-events"
import { formatCurrency } from "@/lib/utils"
import dynamic from "next/dynamic"

const CreateOrderModal = dynamic(() => import("./CreateOrderModal").then(mod => mod.CreateOrderModal), {
    ssr: false,
    loading: () => <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"><div className="animate-spin text-white w-10 h-10 border-4 border-current border-t-transparent rounded-full" /></div>
})

// ─── OrderCard ────────────────────────────────────────────────────────
function OrderCard({ order, onAction, busy, tableName }: {
    order: WaiterOrder
    onAction: (id: string, status: string) => void
    busy: boolean
    tableName?: string
}) {
    const colorMap: Record<string, string> = {
        PENDING: "#f59e0b",
        APPROVED: "#8b5cf6",
        PREPARING: "#3b82f6",
        READY: "#22c55e",
    }

    const labelMap: Record<string, string> = {
        PENDING: "Pendiente",
        APPROVED: "Aprobado",
        PREPARING: "En Cocina",
        READY: "Listo",
        SERVED: "Servido",
        DELIVERED: "Entregado",
        CANCELLED: "Cancelado",
    }

    const nextAction: Record<string, { label: string; icon: React.ReactNode; status: string; color: string }> = {
        PENDING: { label: "Aprobar", icon: <CheckCircle2 className="w-4 h-4" />, status: "APPROVED", color: "bg-purple-600 text-white hover:bg-purple-700" },
        // Los estados APPROVED y PREPARING son gestionados por Cocina (/kitchen)
        READY: { label: "Servido", icon: <CheckCircle2 className="w-4 h-4" />, status: "SERVED", color: "bg-emerald-600 text-white hover:bg-emerald-700" },
    }

    const action = nextAction[order.status]
    const isTerminal = ["SERVED", "DELIVERED", "CANCELLED"].includes(order.status)

    return (
        <Card className="w-full overflow-hidden border-l-8 border-l-primary transition-shadow hover:shadow-lg">
            <CardHeader className="pb-2 px-4 pt-3">
                <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0">
                        <CardTitle className="text-lg flex items-center gap-2 flex-wrap">
                            {tableName || (order.tableNumber ? `Mesa ${order.tableNumber}` : "Sin Mesa")}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                            #{order.orderNumber || order.id.slice(-6)} {order.customerName && `• ${order.customerName}`}
                        </p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1 bg-muted px-2 py-0.5 rounded-full">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true, locale: es })}
                    </span>
                </div>
            </CardHeader>

            <CardContent className="px-4 pb-2">
                <div className="space-y-1 text-sm">
                    {order.items.map((item, i) => (
                        <div key={i} className="flex justify-between">
                            <span><span className="font-semibold mr-1">{item.quantity}×</span>{item.productName}</span>
                            <span className="text-muted-foreground">{formatCurrency(Number(item.price) * item.quantity)}</span>
                        </div>
                    ))}
                </div>

                {order.notes && (
                    <p className="mt-2 text-xs bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 p-2 rounded italic">
                        "{order.notes}"
                    </p>
                )}

                <Separator className="my-2" />
                <div className="flex justify-between font-bold text-base">
                    <span>Total</span>
                    <span>{formatCurrency(Number(order.totalAmount))}</span>
                </div>
            </CardContent>

            {!isTerminal && (
                <CardFooter className="px-4 pb-3 pt-1 flex w-full gap-2">
                    {order.status === "PENDING" && (
                        <Button variant="destructive" size="sm" disabled={busy} className="flex-1 font-bold"
                            onClick={() => { if (confirm("¿Cancelar esta orden?")) onAction(order.id, "CANCELLED") }}>
                            <XCircle className="w-4 h-4 mr-1" /> Cancelar
                        </Button>
                    )}
                    {action && (
                        <Button size="sm" disabled={busy} className={`flex-1 font-bold shadow-none ring-0 focus:ring-0 ${action.color}`}
                            onClick={() => onAction(order.id, action.status)}>
                            {action.icon} <span className="ml-1">{action.label}</span>
                        </Button>
                    )}
                </CardFooter>
            )}
        </Card>
    )
}

// ─── Main Waiter Client ───────────────────────────────────────────────
export function WaiterClient({ initialTables = [] }: { initialTables?: Table[] }) {
    const { tenantId } = useTenant();

    const { user, isAdmin, loading: authLoading } = useAuth()
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    // Default to 'active' if no tab param
    const tab = searchParams?.get("tab") || "active"

    const [orders, setOrders] = useState<WaiterOrder[]>([])
    const [loading, setLoading] = useState(true)
    const [busy, setBusy] = useState(false)
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [selectedTable, setSelectedTable] = useState<string>("all")

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

    const fetchOrders = useCallback(async () => {
        try {
            const data = await getAdminOrders(undefined, true);
            setOrders(data as any) // Type update might be needed if WaiterOrder != Order
        } catch (e) {
            // Optional: toast error
        } finally {
            setLoading(false)
        }
    }, [])

    // Initial fetch
    useEffect(() => {
        fetchOrders()
    }, [fetchOrders])

    // Real-time updates via SSE
    useOrderEvents((event) => {
        // Refresh full list to ensure consistency (simplest approach for now)
        // Optimization: update local state based on event data
        fetchOrders()
    })

    const handleAction = async (orderId: string, status: string) => {
        setBusy(true)
        try {
            await updateOrderStatus(orderId, status as any);
            await fetchOrders()
        } catch (e: any) {
            alert(`Error: ${e.message}`)
        } finally {
            setBusy(false)
        }
    }

    // ── Table Map ──
    const tableMap = new Map(initialTables.map(t => [t.id, t.label]))

    // ── Derived data ──
    const filteredOrders = selectedTable === "all"
        ? orders
        : orders.filter(o => (o as any).tableId === selectedTable || o.tableNumber?.toString() === selectedTable)

    const active = filteredOrders.filter(o => ["PENDING", "APPROVED", "PREPARING", "READY"].includes(o.status))
    const pending = filteredOrders.filter(o => o.status === "PENDING")
    const kitchen = filteredOrders.filter(o => ["APPROVED", "PREPARING"].includes(o.status))
    const ready = filteredOrders.filter(o => o.status === "READY")
    const completed = filteredOrders.filter(o => ["SERVED", "DELIVERED", "CANCELLED"].includes(o.status))

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!isAdmin && user?.role !== "WAITER") {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <p className="text-destructive font-medium">No tienes acceso a esta vista.</p>
            </div>
        )
    }

    const renderList = (list: WaiterOrder[], empty: string) =>
        list.length === 0
            ? <p className="text-center text-muted-foreground py-12">{empty}</p>
            : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{list.map(o => (
                <OrderCard
                    key={o.id}
                    order={o}
                    onAction={handleAction}
                    busy={busy}
                    tableName={o.tableNumber ? tableMap.get(o.tableNumber) : undefined}
                />
            ))}</div>

    return (
        <AdminPageWrapper
            title="POS — Mesero"
            description="Gestiona las órdenes de las mesas en tiempo real"
            actions={
                <div className="flex w-full sm:w-auto gap-2">
                    <Button variant="outline" size="lg" className="flex-1 sm:flex-none font-bold" onClick={() => { setLoading(true); fetchOrders() }}>
                        <RefreshCw className="w-5 h-5 sm:mr-2" /> <span className="hidden sm:inline">Actualizar</span><span className="inline sm:hidden">Refrescar</span>
                    </Button>
                    <Button size="lg" onClick={() => setIsCreateOpen(true)} className="flex-1 sm:flex-none font-bold bg-primary text-primary-foreground hover:bg-primary/90">
                        <Plus className="w-5 h-5 sm:mr-2" /> Nueva Orden
                    </Button>
                </div>
            }
        >
            {/* Table Filter  */}
            <div className="mb-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="w-full sm:w-64">
                    <select
                        value={selectedTable}
                        onChange={(e) => setSelectedTable(e.target.value)}
                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                        <option value="all">Todas las mesas</option>
                        {initialTables.map(t => (
                            <option key={t.id} value={t.id}>{t.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Stats strip - Clickable for filtering */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: "Activas", count: active.length, color: "text-primary", tab: "active" },
                    { label: "Pendientes", count: pending.length, color: "text-amber-500", tab: "pending" },
                    { label: "En Cocina", count: kitchen.length, color: "text-blue-500", tab: "kitchen" },
                    { label: "Listas", count: ready.length, color: "text-green-500", tab: "ready" },
                    //{ label: "Completadas", count: completed.length, color: "text-muted-foreground", tab: "history" },
                ].map(s => (
                    <Card
                        key={s.label}
                        className={`p-3 text-center cursor-pointer transition-all hover:bg-muted/50 ${tab === s.tab ? 'ring-2 ring-primary bg-muted/30' : ''}`}
                        onClick={() => router.push(`${pathname}?tab=${s.tab}`)}
                    >
                        <p className={`text-3xl font-bold ${s.color}`}>{s.count}</p>
                        <p className="text-xs text-muted-foreground">{s.label}</p>
                    </Card>
                ))}
            </div>

            {/* Tabs Content Wrapper */}
            <Tabs
                value={tab}
                onValueChange={(val) => router.push(`${pathname}?tab=${val}`)}
                className="mt-4"
            >
                {/* Mobile Tabs Removed - Using Stats Cards above instead */}
                <TabsList className="hidden mb-4">
                    {/* Hidden but kept for a moment if needed for a11y, but effectively removed from UI */}
                </TabsList>

                <TabsContent value="active" className="mt-4">
                    {renderList(active, "No hay órdenes activas")}
                </TabsContent>
                <TabsContent value="pending" className="mt-4">
                    {renderList(pending, "No hay órdenes pendientes")}
                </TabsContent>
                <TabsContent value="kitchen" className="mt-4">
                    {renderList(kitchen, "No hay órdenes en cocina")}
                </TabsContent>
                <TabsContent value="ready" className="mt-4">
                    {renderList(ready, "No hay órdenes listas")}
                </TabsContent>
                <TabsContent value="history" className="mt-4">
                    {renderList(completed, "No hay historial reciente")}
                </TabsContent>
            </Tabs>


            <CreateOrderModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                tables={initialTables}
                onOrderCreated={fetchOrders}
            />
        </AdminPageWrapper>
    )
}
