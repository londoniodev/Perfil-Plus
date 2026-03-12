"use client"

import { useState } from "react"
import { Button, Card, CardContent, CardFooter, CardHeader, CardTitle, Badge, useToast } from "@alvarosky/ui"
import { MapPin, CheckCircle, Navigation, Loader2 } from "lucide-react"
import { markOrderAsDelivered } from "@/actions/driver"

export function DriverOrderCard({ order, onDelivered }: { order: any, onDelivered: () => void }) {
    const toast = useToast()
    const [loading, setLoading] = useState(false)

    // Logica de Cobro (Evaluar el pago). 
    // Si no está el amount o pago status bien definido desde la Phase 1, asumimos status PENDING significa cobrar
    // Ideal: si order.paymentStatus !== "PAID"
    const isPaid = order.paymentStatus === 'PAID' || order.status === 'PAID' || order.orderType === 'DIGITAL';
    const totalAmount = order.total || order.items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0)

    const handleDeliver = async () => {
        setLoading(true)
        const res = await markOrderAsDelivered(order.id)
        if (res.success) {
            toast.success("¡Entregado!", "Buen trabajo.")
            onDelivered()
        } else {
            toast.error("Error", res.error || "No se pudo actualizar el estado.")
            setLoading(false)
        }
    }

    // Navegación GPS (Google Maps URL con lat, lng)
    const canNavigate = order.shippingData?.lat && order.shippingData?.lng
    const mapsUrl = canNavigate 
        ? `https://www.google.com/maps/dir/?api=1&destination=${order.shippingData.lat},${order.shippingData.lng}`
        : null

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val)
    }

    return (
        <Card className="mb-6 shadow-md border-0 border-t-4 border-t-primary rounded-xl overflow-hidden active:scale-[0.99] transition-transform">
            <CardHeader className="bg-muted/10 p-5 pb-3">
                <div className="flex justify-between items-center mb-1">
                    <CardTitle className="text-xl font-black text-gray-800">#{order.orderNumber.split('-').pop()}</CardTitle>
                    <Badge variant={order.status === 'IN_TRANSIT' ? 'default' : 'outline'} className="text-xs px-2 py-1">
                        {order.status === 'IN_TRANSIT' ? 'En Camino' : 'Asignado'}
                    </Badge>
                </div>
                <p className="text-xl font-bold text-gray-900 mt-2">{order.shippingData?.name || order.customerName}</p>
                <p className="text-base text-gray-600 mt-1 flex items-start gap-1">
                    <MapPin className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" aria-hidden="true" /> 
                    <span>{order.shippingData?.address || "Dirección no provista"}, {order.shippingData?.city}</span>
                </p>
            </CardHeader>
            
            <CardContent className="p-0">
                {/* Banner de Recaudo */}
                {!isPaid ? (
                    <div className="bg-red-500 text-white p-4 flex flex-col items-center justify-center text-center shadow-inner">
                        <span className="text-sm font-semibold uppercase tracking-wider opacity-90 mb-1">🔴 Cobrar al Cliente</span>
                        <span className="text-3xl font-black tracking-tight">{formatCurrency(totalAmount)}</span>
                        <span className="text-xs mt-1 opacity-80">(Efectivo o Datáfono)</span>
                    </div>
                ) : (
                    <div className="bg-emerald-500 text-white p-4 flex flex-col items-center justify-center text-center shadow-inner">
                        <span className="text-lg font-bold flex items-center gap-2">
                            <CheckCircle className="w-5 h-5" aria-hidden="true"/> 🟢 PAGADO
                        </span>
                        <span className="text-sm mt-1 opacity-90">Solo entregar el pedido</span>
                    </div>
                )}

                {order.notes && (
                    <div className="p-4 bg-amber-50 border-y border-amber-100/50">
                        <p className="text-sm text-amber-800 font-medium">📝 Nota: {order.notes}</p>
                    </div>
                )}
            </CardContent>

            <CardFooter className="p-4 flex flex-col gap-3 bg-white">
                {canNavigate ? (
                    <a 
                        href={mapsUrl as string} 
                        target="_blank" 
                        rel="noreferrer"
                        className="w-full"
                    >
                        <Button className="w-full h-14 text-lg font-bold bg-blue-600 hover:bg-blue-700 shadow-md">
                            <Navigation className="w-6 h-6 mr-3" aria-hidden="true" /> Navegar al Destino
                        </Button>
                    </a>
                ) : (
             <Button className="w-full h-14 text-lg font-bold bg-gray-200 text-gray-500 hover:bg-gray-200" disabled>
                 <MapPin className="w-6 h-6 mr-3" aria-hidden="true" /> Sin GPS Exacto
             </Button>
         )}

                <Button 
                    onClick={handleDeliver} 
                    disabled={loading}
                    variant="outline" 
                    className="w-full h-14 text-lg font-bold border-2 text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100"
                >
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" aria-hidden="true" /> : <><CheckCircle className="w-6 h-6 mr-3" aria-hidden="true"/> Marcar como Entregado</>}
                </Button>
            </CardFooter>
        </Card>
    )
}
