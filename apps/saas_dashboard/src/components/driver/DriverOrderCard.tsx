"use client"

import { useState } from "react"
import { Button, Card, CardContent, CardFooter, CardHeader, CardTitle, Badge, useToast } from "@alvarosky/ui"
import { MapPin, CheckCircle, Navigation, Loader2 } from "lucide-react"
import { markOrderAsDelivered } from "@/actions/driver"

export function DriverOrderCard({ order, onDelivered }: { order: any, onDelivered: () => void }) {
    const toast = useToast()
    const [loading, setLoading] = useState(false)

    const isPaid = order.paymentStatus === 'PAID' || order.status === 'PAID' || order.orderType === 'DIGITAL';
    const totalAmount = order.total || order.items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0)

    const handleDeliver = async () => {
        setLoading(true)
        const res = await markOrderAsDelivered(order.id)
        if (res.success) {
            toast.success("¡Entregado!", "El pedido ha sido marcado como entregado.")
            onDelivered()
        } else {
            toast.error("Error", res.error || "No se pudo actualizar el estado.")
            setLoading(false)
        }
    }

    // Google Maps URL
    const canNavigate = order.shippingData?.lat && order.shippingData?.lng
    const mapsUrl = canNavigate 
        ? `https://www.google.com/maps/dir/?api=1&destination=${order.shippingData.lat},${order.shippingData.lng}`
        : null

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val)
    }

    return (
        <article className="mb-6 rounded-2xl overflow-hidden bg-black/40 border border-white/10 backdrop-blur-xl shadow-2xl transition-all hover:border-white/20">
            {/* Header: Order Info */}
            <CardHeader className="p-5 pb-4 border-b border-white/5 space-y-4">
                <div className="flex justify-between items-start">
                    <div>
                        <Badge variant="outline" className="text-xs px-2 py-0.5 border-white/20 text-white/70 bg-black/20 mb-2 font-medium tracking-wider">
                            {order.status === 'IN_TRANSIT' ? 'En Camino' : 'Asignado'}
                        </Badge>
                        <CardTitle className="text-2xl font-black text-white tracking-tight">
                            #{order.orderNumber.split('-').pop()}
                        </CardTitle>
                    </div>
                </div>

                <div className="space-y-1">
                    <p className="text-lg font-bold text-white/90">{order.shippingData?.name || order.customerName}</p>
                    <p className="text-sm text-white/60 flex items-start gap-1.5 leading-snug">
                        <MapPin className="w-4 h-4 text-white/40 shrink-0 mt-0.5" aria-hidden="true" /> 
                        <span>{order.shippingData?.address || "Dirección no provista"}, {order.shippingData?.city}</span>
                    </p>
                </div>
            </CardHeader>
            
            <CardContent className="p-0">
                {/* Cobro / Estado de Pago */}
                {!isPaid ? (
                    <div className="bg-red-500/10 border-y border-red-500/20 p-5 flex flex-col items-center justify-center text-center">
                        <span className="text-xs font-bold uppercase tracking-widest text-red-400 mb-1 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" aria-hidden="true"></span>
                            Cobrar al Cliente
                        </span>
                        <span className="text-4xl font-black tracking-tighter text-white">{formatCurrency(totalAmount)}</span>
                        <span className="text-xs mt-1.5 text-red-300/80 font-medium">Efectivo o Datáfono</span>
                    </div>
                ) : (
                    <div className="bg-emerald-500/10 border-y border-emerald-500/20 p-5 flex flex-col items-center justify-center text-center">
                        <span className="text-lg font-bold flex items-center gap-2 text-emerald-400">
                            <CheckCircle className="w-5 h-5" aria-hidden="true"/> PAGADO
                        </span>
                        <span className="text-sm mt-1 text-emerald-300/70 font-medium">Solo entregar pedido</span>
                    </div>
                )}

                {/* Notas */}
                {order.notes && (
                    <div className="px-5 py-4 bg-white/5 border-b border-white/5">
                        <p className="text-sm text-white/70 font-medium leading-relaxed">
                            <span className="text-white/40 mr-2">📝</span>
                            {order.notes}
                        </p>
                    </div>
                )}
            </CardContent>

            <CardFooter className="p-5 flex flex-col gap-3 bg-black/20">
                {canNavigate ? (
                    <a 
                        href={mapsUrl as string} 
                        target="_blank" 
                        rel="noreferrer"
                        className="w-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black rounded-lg"
                        aria-label="Abrir mapa para navegar al destino"
                    >
                        <Button className="w-full h-14 text-base font-bold bg-white/10 hover:bg-white/20 text-white border-0 shadow-none rounded-xl transition-colors">
                            <Navigation className="w-5 h-5 mr-2.5 opacity-80" aria-hidden="true" /> Navegar al Destino
                        </Button>
                    </a>
                ) : (
                    <Button className="w-full h-14 text-base font-bold bg-white/5 text-white/30 hover:bg-white/5 cursor-not-allowed rounded-xl" disabled>
                        <MapPin className="w-5 h-5 mr-2.5 opacity-50" aria-hidden="true" /> Sin GPS Exacto
                    </Button>
                )}

                <Button 
                    onClick={handleDeliver} 
                    disabled={loading}
                    className="w-full h-14 text-base font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] rounded-xl transition-all"
                    aria-label="Marcar pedido como entregado"
                >
                    {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                    ) : (
                        <><CheckCircle className="w-5 h-5 mr-2.5" aria-hidden="true"/> Entregado</>
                    )}
                </Button>
            </CardFooter>
        </article>
    )
}
