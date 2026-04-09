"use client"

import { useEffect, useRef, useState, Suspense } from "react"
import Link from "next/link"
import { CheckCircle, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@alvarosky/ui"
import { useCart } from "@/store/use-cart"
import { motion } from "framer-motion"
import { useTenant } from "@/app/providers"
import { useSearchParams } from "next/navigation"
import { trackOrder, verifyBoldPayment } from "@/lib/api"

import { OrderTrackingModal } from "@/components/menu/OrderTrackingModal"

function CheckoutSuccessContent() {
    const { clearCart } = useCart()
    const { features, tenantId } = useTenant()
    const searchParams = useSearchParams()
    const orderId = searchParams.get("orderId")
    const orderNumber = searchParams.get("orderNumber") || ""
    
    const [status, setStatus] = useState<"loading" | "polling" | "success" | "error">("loading")
    const [orderData, setOrderData] = useState<any>(null)
    const [pollCount, setPollCount] = useState(0)
    const [isTrackingOpen, setIsTrackingOpen] = useState(false)

    const isCleared = useRef(false)

    const isRestaurant = features.map(f => f.toUpperCase()).includes("RESTAURANT")
    const returnHref = isRestaurant ? "/menu" : "/tienda"
    const returnLabel = isRestaurant ? "Volver al Menú" : "Volver a la Tienda"
    
    // Auto-open tracking modal when success
    useEffect(() => {
        if (status === "success" && orderId) {
            setIsTrackingOpen(true)
        }
    }, [status, orderId])

    // Clear cart effect
    useEffect(() => {
        if (!isCleared.current && status === "success") {
            clearCart()
            isCleared.current = true
        }
    }, [clearCart, status])

    // Polling effect
    useEffect(() => {
        if (!orderId) {
            setStatus("success") // Fallback si no hay orderId válido
            return
        }

        let isMounted = true

        const fetchStatus = async () => {
            try {
                if (isMounted) setStatus(pollCount > 0 ? "polling" : "loading")
                const data = await trackOrder(orderId, tenantId)
                
                if (data && isMounted) {
                    setOrderData(data)
                    // Consideramos éxito si el estado NO es PENDING (ya es ACCEPTED, APPROVED, etc)
                    if (data.status !== 'PENDING') {
                        setStatus("success")
                    } else {
                        // Bold polling fallback: verificar directo con Bold API
                        try {
                            const boldResult = await verifyBoldPayment(orderId, tenantId)
                            if (boldResult.status === 'ACCEPTED') {
                                setOrderData({ ...data, status: 'ACCEPTED' })
                                setStatus("success")
                                return
                            }
                        } catch {
                            // Silently continue — no es crítico
                        }

                        // Polling 
                        if (pollCount < 10) { // Más intentos para Bold (~30 seg)
                            setTimeout(() => {
                                if (isMounted) setPollCount(prev => prev + 1)
                            }, 3000)
                        } else {
                            // Max polling reached, we show success but advise it might take a moment
                            setStatus("success")
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching order status:", error)
                if (isMounted) setStatus("error")
            }
        }

        fetchStatus()

        return () => { isMounted = false }
    }, [orderId, pollCount, tenantId])

    const renderContent = () => {
        if (status === "loading" || status === "polling") {
            return (
                <div className="flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" aria-hidden="true" />
                    <h2 className="text-xl font-semibold text-slate-800">
                        {status === "polling" ? "Confirmando pago con el banco..." : "Cargando..."}
                    </h2>
                    <p className="text-slate-500 text-sm">Por favor espera un momento, estamos validando tu pedido.</p>
                </div>
            )
        }

        if (status === "error") {
            return (
                <div className="flex flex-col items-center justify-center space-y-4">
                    <AlertCircle className="w-12 h-12 text-red-500" aria-hidden="true" />
                    <h2 className="text-xl font-semibold text-slate-800">No pudimos verificar el estado del pedido</h2>
                    <p className="text-slate-500">Es posible que el pago siga en proceso. Te notificaremos pronto.</p>
                    <div className="flex gap-4 mt-4">
                        <Button asChild>
                            <Link href="/">Volver al inicio</Link>
                        </Button>
                    </div>
                </div>
            )
        }

        const customerName = orderData?.customerName || ""
        const trackingCode = orderData?.orderNumber || orderNumber

        return (
            <>
                <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                    <CheckCircle className="w-12 h-12 text-green-600" aria-hidden="true" />
                </div>

                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-4">
                    ¡Pedido Confirmado!
                </h1>

                <p className="text-slate-600 mb-2 font-medium">
                    Hola {customerName ? customerName.split(" ")[0] : "cliente"}, tu pedido ya está en manos de nuestro equipo.
                </p>

                {trackingCode && (
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 mb-6 flex flex-col items-center gap-1">
                        <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Código de Seguimiento</span>
                        <span className="text-lg font-mono font-bold text-primary">#{trackingCode}</span>
                    </div>
                )}

                <p className="text-slate-500 mb-8 leading-relaxed text-sm">
                    {pollCount >= 10 && orderData?.status === 'PENDING' 
                        ? "Estamos esperando la confirmación final del banco, pero ya tenemos tu pedido anotado. ¡Pronto verás el estado actualizado!"
                        : isRestaurant
                            ? "Tu pedido ha sido recibido y entrará en cocina en unos instantes."
                            : "Tu compra se ha procesado correctamente. ¡Gracias por elegirnos!"
                    }
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    {orderId && (
                        <Button 
                            onClick={() => setIsTrackingOpen(true)}
                            variant="default" 
                            className="w-full sm:w-auto h-12 px-8 rounded-full shadow-lg shadow-primary/25 font-bold"
                        >
                            Ver Estado del Pedido
                        </Button>
                    )}
                    <Button asChild variant="outline" className="w-full sm:w-auto h-12 px-8 rounded-full font-bold text-slate-700 bg-white border-slate-200">
                        <Link href={returnHref}>
                            {returnLabel}
                        </Link>
                    </Button>
                </div>

                {orderId && (
                    <OrderTrackingModal 
                        isOpen={isTrackingOpen}
                        onClose={() => setIsTrackingOpen(false)}
                        orderId={orderId}
                        orderNumber={trackingCode || "N/A"}
                    />
                )}
            </>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 sm:p-12 text-center border border-slate-100"
            >
                {renderContent()}
            </motion.div>
        </div>
    )
}

export default function CheckoutSuccessPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center p-6"><Loader2 className="w-12 h-12 text-primary animate-spin" /></div>}>
            <CheckoutSuccessContent />
        </Suspense>
    )
}
