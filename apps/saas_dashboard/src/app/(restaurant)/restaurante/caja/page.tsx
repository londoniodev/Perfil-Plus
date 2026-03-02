'use client';

import { useState, useEffect, useMemo } from 'react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Button,
    Checkbox,
    Badge,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Separator,
    AdminPageWrapper,
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    ScrollArea,
} from '@alvarosky/ui';
import { toast } from 'sonner';
import { getAdminOrders, payOrder } from '@/lib/api';
import { Order, OrderItem } from '@/types/restaurant';
import { Loader2, DollarSign, CreditCard, Banknote, RefreshCcw, HandCoins, Clock } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { getZReport, ZReport } from '@/actions/admin/reports';
import { getTables } from "@/actions/admin/tables";

// ─── ZReportContent (Module-scope for React Doctor compliance) ───
function ZReportContent({ report }: { report: ZReport }) {
    return (
        <div className="space-y-5 pt-2">
            {/* Ventas Totales */}
            <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 text-center">
                <p className="text-sm text-muted-foreground uppercase font-bold tracking-wider">Ventas Totales</p>
                <p className="text-4xl font-black text-primary">{formatCurrency(report.totalSales)}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted/30 rounded-lg border">
                    <p className="text-xs text-muted-foreground uppercase font-bold">Órdenes</p>
                    <p className="text-xl font-bold">{report.orderCount}</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg border">
                    <p className="text-xs text-muted-foreground uppercase font-bold">Fecha</p>
                    <p className="text-sm font-bold">{new Date().toLocaleDateString()}</p>
                </div>
            </div>

            {/* Desglose por Método */}
            <div className="space-y-3">
                <h4 className="text-sm font-bold uppercase text-muted-foreground pb-1 border-b">Desglose por Método</h4>
                {report.byMethod.map((m) => (
                    <div key={m.method} className="flex justify-between items-center py-1">
                        <div className="flex items-center gap-2">
                            {m.method === 'CASH' && <Banknote className="w-4 h-4 text-green-600" aria-hidden="true" />}
                            {m.method === 'CARD' && <CreditCard className="w-4 h-4 text-blue-600" aria-hidden="true" />}
                            <span className="font-medium">{m.method} ({m.count})</span>
                        </div>
                        <span className="font-bold font-mono">{formatCurrency(m.amount)}</span>
                    </div>
                ))}
            </div>

            {/* Productos Vendidos */}
            {report.productSummary && report.productSummary.length > 0 && (
                <section>
                    <h4 className="text-sm font-bold uppercase text-muted-foreground pb-1 border-b mb-2">
                        Productos Vendidos
                    </h4>
                    <ScrollArea className="max-h-[250px]">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-xs text-muted-foreground uppercase border-b">
                                    <th className="text-left py-2 pr-2 font-bold">Producto</th>
                                    <th className="text-right py-2 px-1 font-bold">Cant.</th>
                                    <th className="text-right py-2 px-1 font-bold">Venta</th>
                                    <th className="text-right py-2 px-1 font-bold">Costo</th>
                                    <th className="text-right py-2 pl-1 font-bold">Margen</th>
                                </tr>
                            </thead>
                            <tbody>
                                {report.productSummary.map((p, idx) => (
                                    <tr key={`${p.productName}-${idx}`} className="border-b border-muted/30 last:border-0">
                                        <td className="py-1.5 pr-2">
                                            <span className="font-medium">{p.productName}</span>
                                            {p.variantName && (
                                                <span className="text-xs text-muted-foreground ml-1">({p.variantName})</span>
                                            )}
                                        </td>
                                        <td className="text-right py-1.5 px-1 font-mono">{p.qty}</td>
                                        <td className="text-right py-1.5 px-1 font-mono">{formatCurrency(p.totalSales)}</td>
                                        <td className="text-right py-1.5 px-1 font-mono text-muted-foreground">{formatCurrency(p.totalCost)}</td>
                                        <td className="text-right py-1.5 pl-1">
                                            <span className={`font-mono font-bold ${p.margin >= 50 ? 'text-green-600' : p.margin >= 25 ? 'text-yellow-600' : 'text-red-500'}`}>
                                                {p.margin.toFixed(1)}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </ScrollArea>
                </section>
            )}

            {/* Balance Final */}
            <section className="bg-muted/20 p-4 rounded-xl border space-y-2">
                <h4 className="text-sm font-bold uppercase text-muted-foreground">Balance Final</h4>
                <Separator />
                <div className="flex justify-between items-center">
                    <span className="text-sm">Ventas Totales</span>
                    <span className="font-bold font-mono">{formatCurrency(report.totalSales)}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm">Costo Total</span>
                    <span className="font-bold font-mono text-red-500">−{formatCurrency(report.totalCost)}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                    <span className="font-bold">Utilidad Bruta</span>
                    <div className="text-right">
                        <span className="font-black text-lg text-primary font-mono">
                            {formatCurrency(report.totalSales - report.totalCost)}
                        </span>
                        <span className="text-xs text-muted-foreground ml-2">
                            ({report.totalMargin.toFixed(1)}%)
                        </span>
                    </div>
                </div>
            </section>

            <Button className="w-full" variant="outline" onClick={() => window.print()}>
                Imprimir Reporte
            </Button>
        </div>
    );
}

export default function CashierPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'OPEN' | 'DELIVERED' | 'ALL'>('OPEN');
    const [zReport, setZReport] = useState<ZReport | null>(null);
    const [fetchingZ, setFetchingZ] = useState(false);

    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            if (filter === 'ALL') return true;
            if (filter === 'DELIVERED') return order.status === 'DELIVERED' || order.status === 'CANCELLED'; // Incluimos cancelados en historial/pagados? Mejor solo DELIVERED para "Pagados"
            if (filter === 'OPEN') return order.status !== 'DELIVERED' && order.status !== 'CANCELLED';
            return true;
        });
    }, [orders, filter]);
    // orderId -> Set of itemIds selected for payment
    const [selectedItems, setSelectedItems] = useState<Record<string, Set<string>>>({});
    const [paymentMethods, setPaymentMethods] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState<string | null>(null);
    const [tableNames, setTableNames] = useState<Record<string, string>>({});  // Map<TableId, TableLabel>

    useEffect(() => {
        getTables().then(tables => {
            const map: Record<string, string> = {};
            tables.forEach((t: any) => { map[t.id] = t.label });
            setTableNames(map);
        }).catch(err => console.error("Failed to load tables", err));
    }, []);

    const fetchOrders = async () => {
        try {
            // Traemos órdenes activas + servidas
            // Statuses relevantes para caja: PENDING, APPROVED (Cocina), PREPARING, READY, SERVED
            // Quizas solo SERVED y READY? O todas por si quieren pagar antes.
            // Traemos 'activeOnly' que incluye la mayoría.
            const data = await getAdminOrders(undefined, true);

            // Filtramos las que ya están totalmente pagadas y entregadas (DELIVERED) si queremos
            // Pero getAdminOrders con activeOnly ya filtra DELIVERED antiguos.
            // Nos interesa ver órdenes que tengan items sin pagar.
            // O órdenes en curso.
            setOrders(data);
        } catch (error) {
            console.error("Error fetching orders:", error);
            // toast.error("Error al cargar órdenes"); // Evitar spam en polling
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 10000); // Polling cada 10s
        return () => clearInterval(interval);
    }, []);

    // Helpers
    const toggleItem = (orderId: string, itemId: string) => {
        setSelectedItems(prev => {
            const currentSet = new Set(prev[orderId] || []);
            if (currentSet.has(itemId)) {
                currentSet.delete(itemId);
            } else {
                currentSet.add(itemId);
            }
            return { ...prev, [orderId]: currentSet };
        });
    };

    const toggleAll = (orderId: string, items: OrderItem[]) => {
        const unpaidItems = items.filter(i => !i.isPaid);
        const allUnpaidIds = unpaidItems.map(i => i.id);

        setSelectedItems(prev => {
            const currentSet = new Set(prev[orderId] || []);
            const allSelected = allUnpaidIds.every(id => currentSet.has(id));

            if (allSelected) {
                // Deseleccionar todo
                allUnpaidIds.forEach(id => currentSet.delete(id));
            } else {
                // Seleccionar todo lo impago
                allUnpaidIds.forEach(id => currentSet.add(id));
            }
            return { ...prev, [orderId]: currentSet };
        });
    };

    const getOrderSelectionTotal = (order: Order) => {
        const selectedIds = selectedItems[order.id] || new Set();
        return order.items
            .filter(item => selectedIds.has(item.id))
            .reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0); // Precio incluye modifiers en el backend model normalmente, o multiplicar? 
        // En Prisma schema: price es Decimal unitario calculado. quantity es integer.
        // Si el backend entrega 'price' ya multiplicado por items? No, es unitario.
        // Revisar OrderItem en backend: price Decimal.
    };

    const handlePay = async (orderId: string) => {
        const selectedIds = selectedItems[orderId] || new Set();
        if (selectedIds.size === 0) {
            toast.error("Selecciona al menos un ítem para pagar");
            return;
        }

        const amount = getOrderSelectionTotal(orders.find(o => o.id === orderId)!);
        const method = paymentMethods[orderId] || 'CASH';

        // Check if paying all remaining items
        const order = orders.find(o => o.id === orderId)!;
        const unpaidItems = order.items.filter(i => !i.isPaid);
        const isFullPayment = unpaidItems.every(i => selectedIds.has(i.id));

        setProcessing(orderId);
        try {
            await payOrder(orderId, {
                amount,
                method,
                itemIds: Array.from(selectedIds),
                closeOrder: isFullPayment // Sugerir cerrar si paga todo
            });
            toast.success("Pago registrado exitosamente");

            // Limpiar selección
            setSelectedItems(prev => {
                const next = { ...prev };
                delete next[orderId];
                return next;
            });

            fetchOrders();
        } catch (error) {
            toast.error("Error al procesar el pago");
            console.error(error);
        } finally {
            setProcessing(null);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin w-12 h-12 text-primary" /></div>;
    }

    return (
        <AdminPageWrapper
            title="Caja & Facturación"
            description="Gestiona pagos parciales y cierres de cuenta."
            className="p-6 max-w-5xl mx-auto"
            actions={
                <div className="flex w-full md:w-auto gap-2">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button
                                variant="outline"
                                className="w-1/2 md:w-auto border-primary/50 text-primary hover:bg-primary/10"
                                onClick={async () => {
                                    setFetchingZ(true);
                                    const res = await getZReport();
                                    if (res.success) setZReport(res.data!);
                                    setFetchingZ(false);
                                }}
                            >
                                <Banknote className="w-4 h-4 mr-2" />
                                Cierre Z
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                                    <Clock className="w-6 h-6 text-primary" aria-hidden="true" />
                                    Reporte de Cierre Z
                                </DialogTitle>
                            </DialogHeader>
                            {fetchingZ ? (
                                <div className="py-10 flex justify-center"><Loader2 className="animate-spin text-primary" aria-hidden="true" /></div>
                            ) : zReport ? (
                                <ZReportContent report={zReport} />
                            ) : (
                                <p className="text-center py-10 text-muted-foreground">No hay datos para hoy.</p>
                            )}
                        </DialogContent>
                    </Dialog>

                    <Button variant="outline" onClick={fetchOrders} disabled={!!processing} className="w-1/2 md:w-auto">
                        <RefreshCcw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Actualizar
                    </Button>
                </div>
            }
        >
            {/* Filters / Slicers */}
            <div className="flex w-full overflow-x-auto no-scrollbar gap-2 pb-2 sm:pb-0">
                <Button
                    variant={filter === 'OPEN' ? 'default' : 'outline'}
                    onClick={() => setFilter('OPEN')}
                    className="rounded-full px-6 transition-all whitespace-nowrap"
                >
                    Por Cobrar
                    {orders.some(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED') && (
                        <Badge variant="secondary" className="ml-2 bg-primary/20 text-primary-foreground h-5 px-1.5 min-w-[1.25rem]">
                            {orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length}
                        </Badge>
                    )}
                </Button>
                <Button
                    variant={filter === 'DELIVERED' ? 'default' : 'outline'}
                    onClick={() => setFilter('DELIVERED')}
                    className="rounded-full px-6 transition-all whitespace-nowrap"
                >
                    Pagados
                </Button>
                <Button
                    variant={filter === 'ALL' ? 'default' : 'outline'}
                    onClick={() => setFilter('ALL')}
                    className="rounded-full px-6 transition-all whitespace-nowrap"
                >
                    Todos
                </Button>
            </div>

            <Accordion type="single" collapsible className="w-full space-y-4">
                {filteredOrders.map((order) => {
                    const selectedIds = selectedItems[order.id] || new Set();
                    const selectionTotal = getOrderSelectionTotal(order);
                    const paidTotal = order.items.filter(i => i.isPaid).reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
                    const orderTotal = Number(order.totalAmount);
                    const remainingTotal = orderTotal - paidTotal; // Aprox, mejor sumar items unpaid

                    // Status Badge Color
                    const getStatusColor = (status: string) => {
                        switch (status) {
                            case 'PENDING': return 'bg-yellow-100 text-yellow-800';
                            case 'SERVED': return 'bg-blue-100 text-blue-800';
                            case 'DELIVERED': return 'bg-green-100 text-green-800';
                            default: return 'bg-gray-100 text-gray-800';
                        }
                    };

                    return (
                        <AccordionItem key={order.id} value={order.id} className="border rounded-lg px-4 bg-card shadow-sm">
                            <AccordionTrigger className="hover:no-underline py-4">
                                <div className="flex justify-between items-center w-full pr-4">
                                    <div className="flex items-center gap-4 text-left">
                                        <div className="p-2 bg-primary/10 rounded-full">
                                            <DollarSign className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">
                                                {order.tableNumber ? (tableNames[order.tableNumber] || `Mesa ${order.tableNumber}`) : 'Orden'}
                                                <span className="text-muted-foreground font-normal ml-2">#{order.orderNumber.split('-').pop()}</span>
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                {order.customerName || 'Cliente General'} • {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right hidden md:block">
                                        <div className="text-xl font-bold">{formatCurrency(remainingTotal)} <span className="text-xs font-normal text-muted-foreground">pendiente</span></div>
                                        <Badge variant="secondary" className={`${getStatusColor(order.status)} border-0`}>{order.status}</Badge>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-2 pb-6">
                                <Separator className="mb-4" />
                                <div className="space-y-4">
                                    {/* Items List */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between py-2 px-2 bg-muted/50 rounded text-sm font-medium text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <Checkbox
                                                    checked={order.items.filter(i => !i.isPaid).every(i => selectedIds.has(i.id)) && order.items.some(i => !i.isPaid)}
                                                    onCheckedChange={() => toggleAll(order.id, order.items)}
                                                    disabled={order.items.every(i => i.isPaid)}
                                                />
                                                <span>Seleccionar Todo</span>
                                            </div>
                                            <div className="grid grid-cols-3 gap-8 w-1/2 text-right">
                                                <span>Precio Unit.</span>
                                                <span>Cant.</span>
                                                <span>Subtotal</span>
                                            </div>
                                        </div>

                                        {order.items.map((item) => {
                                            const isSelected = selectedIds.has(item.id);
                                            const subtotal = Number(item.price) * item.quantity;

                                            return (
                                                <div
                                                    key={item.id}
                                                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${item.isPaid ? 'bg-muted/20 opacity-60' :
                                                        isSelected ? 'bg-primary/5 border-primary/30' : 'bg-background hover:bg-muted/30'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Checkbox
                                                            checked={isSelected || item.isPaid}
                                                            disabled={item.isPaid}
                                                            onCheckedChange={() => toggleItem(order.id, item.id)}
                                                        />
                                                        <div>
                                                            <p className={`font-medium ${item.isPaid ? 'line-through text-muted-foreground' : ''}`}>
                                                                {item.productName}
                                                                {item.variantName && <span className="text-muted-foreground text-xs ml-1">({item.variantName})</span>}
                                                            </p>
                                                            {item.modifiers && item.modifiers.length > 0 && (
                                                                <p className="text-xs text-muted-foreground">
                                                                    + {item.modifiers.map(m => m.modifierName).join(', ')}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-8 w-1/2 text-right font-mono text-sm items-center">
                                                        <span>{formatCurrency(item.price)}</span>
                                                        <span>x{item.quantity}</span>
                                                        <span className="font-bold">{formatCurrency(subtotal)}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <Separator className="my-4" />

                                    {/* Action Bar */}
                                    <div className="flex flex-col md:flex-row justify-between items-end gap-4 bg-muted/10 p-4 rounded-xl border">
                                        <div className="space-y-1 w-full md:w-auto">
                                            <p className="text-sm font-medium mb-2">Método de Pago</p>
                                            <Select
                                                value={paymentMethods[order.id] || 'CASH'}
                                                onValueChange={(val) => setPaymentMethods(prev => ({ ...prev, [order.id]: val }))}
                                            >
                                                <SelectTrigger className="w-full md:w-[200px]">
                                                    <SelectValue placeholder="Seleccionar método" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="CASH"><div className="flex items-center"><Banknote className="w-4 h-4 mr-2" /> Efectivo</div></SelectItem>
                                                    <SelectItem value="CARD"><div className="flex items-center"><CreditCard className="w-4 h-4 mr-2" /> Tarjeta</div></SelectItem>
                                                    <SelectItem value="TRANSFER"><div className="flex items-center"><RefreshCcw className="w-4 h-4 mr-2" /> Transferencia</div></SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                                            <div className="text-right">
                                                <p className="text-sm text-muted-foreground">Total a cobrar ahora</p>
                                                <p className="text-3xl font-black text-primary">{formatCurrency(selectionTotal)}</p>
                                            </div>
                                            <Button
                                                size="lg"
                                                className="w-full md:w-[250px] font-bold text-lg"
                                                disabled={selectionTotal <= 0 || !!processing}
                                                onClick={() => handlePay(order.id)}
                                            >
                                                {processing === order.id ? <Loader2 className="animate-spin mr-2" /> : <HandCoins className="mr-2 w-5 h-5" />}
                                                Registrar Pago
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    );
                })}

                {filteredOrders.length === 0 && !loading && (
                    <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed">
                        <p className="text-muted-foreground text-lg">
                            {filter === 'OPEN' ? 'No hay cuentas por cobrar.' : 'No hay órdenes en esta categoría.'}
                        </p>
                    </div>
                )}
            </Accordion>
        </AdminPageWrapper>
    );
}
