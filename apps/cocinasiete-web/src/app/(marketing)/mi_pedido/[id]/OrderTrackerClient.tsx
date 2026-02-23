"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Check, Clock, Package, Truck, XCircle } from "lucide-react"
import { API_BASE } from "@/lib/config"

type OrderStatus = 'PENDING' | 'APPROVED' | 'PROCESSING' | 'PREPARING' | 'READY' | 'SERVED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED'

interface Order {
    id: string
    orderNumber: string
    status: OrderStatus
    totalAmount: string
    createdAt: string
    customerName?: string
    items: {
        productName: string
        quantity: number
    }[]
}

const steps = [
    { id: 'PENDING', label: 'Sin pagar / Recibido', icon: Clock },
    { id: 'PREPARING', label: 'En preparación', icon: Package },
    { id: 'SHIPPED', label: 'En ruta', icon: Truck },
    { id: 'DELIVERED', label: 'Entregado', icon: Check },
]

export function OrderTrackerClient({ orderId }: { orderId: string }) {
    const [order, setOrder] = useState<Order | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let interval: NodeJS.Timeout
        const fetchOrder = async () => {
            try {
                const res = await fetch(`${API_BASE}/orders/track/${orderId}`)
                if (!res.ok) {
                    if (res.status === 404) throw new Error("Pedido no encontrado")
                    throw new Error("Error al consultar el pedido")
                }
                const data = await res.json()
                setOrder(data)
                setError(null)
            } catch (err: any) {
                setError(err.message)
            } finally {
                setIsLoading(false)
            }
        }

        fetchOrder()

        // Polling every 10 seconds for real-time updates without socket complexity here
        interval = setInterval(fetchOrder, 10000)

        return () => clearInterval(interval)
    }, [orderId])

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mb-4" />
                <p className="text-slate-500 font-medium">Buscando tu pedido...</p>
            </div>
        )
    }

    if (error || !order) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Oops...</h2>
                <p className="text-slate-500">{error || "No pudimos encontrar tu pedido."}</p>
            </div>
        )
    }

    const isCancelled = order.status === 'CANCELLED' || order.status === 'REFUNDED'

    // Map API status to visual step index
    const getStepIndex = (status: OrderStatus) => {
        if (['PENDING'].includes(status)) return 0
        if (['APPROVED', 'PROCESSING', 'PREPARING', 'READY'].includes(status)) return 1
        if (['SHIPPED'].includes(status)) return 2
        if (['DELIVERED', 'SERVED'].includes(status)) return 3
        return 0
    }

    const currentStepIndex = getStepIndex(order.status)

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-slate-900 mb-2">
                        Pedido {order.orderNumber}
                    </h1>
                    <p className="text-slate-500 font-medium">
                        {order.customerName ? `¡Hola ${order.customerName.split(' ')[0]}! ` : ''}
                        Aquí puedes ver el estado de tu orden.
                    </p>
                </div>

                {isCancelled ? (
                    <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
                        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                        <h3 className="text-xl font-bold text-red-900 mb-1">Pedido Cancelado</h3>
                        <p className="text-red-700/80 text-sm font-medium">Tu pedido ha sido cancelado. Si tienes dudas, contáctanos.</p>
                    </div>
                ) : (
                    <div className="py-8">
                        <div className="relative flex justify-between">
                            {/* Line background */}
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1.5 bg-slate-100 rounded-full" />

                            {/* Animated Progress Line */}
                            <motion.div
                                className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 bg-primary rounded-full origin-left"
                                initial={{ width: "0%" }}
                                animate={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                            />

                            {steps.map((step, index) => {
                                const isCompleted = index <= currentStepIndex
                                const isActive = index === currentStepIndex
                                const Icon = step.icon

                                return (
                                    <div key={step.id} className="relative z-10 flex flex-col items-center">
                                        <motion.div
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ delay: index * 0.1 }}
                                            className={`w-12 h-12 rounded-full flex items-center justify-center border-4 border-white transition-colors duration-500 ${isCompleted
                                                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                                                : 'bg-slate-100 text-slate-400'
                                                }`}
                                        >
                                            <Icon className="w-5 h-5" />
                                        </motion.div>
                                        <div className="absolute top-14 text-center w-24 -ml-6">
                                            <p className={`text-xs font-bold transition-colors duration-500 ${isActive ? 'text-primary' : isCompleted ? 'text-slate-800' : 'text-slate-400'
                                                }`}>
                                                {step.label}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        <div className="h-16" /> {/* Spacing for the absolute labels */}
                    </div>
                )}
            </div>

            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 p-8">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Resumen del Pedido</h3>
                <div className="space-y-4">
                    {order.items.map((item, i) => (
                        <div key={i} className="flex justify-between items-center py-3 border-b border-slate-100 last:border-0">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-sm font-bold text-slate-600">
                                    {item.quantity}x
                                </div>
                                <p className="font-medium text-slate-800">{item.productName}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 pt-6 border-t border-slate-100 flex justify-between items-center text-lg font-black text-slate-900">
                    <span>Total</span>
                    <span>${Number(order.totalAmount).toLocaleString()}</span>
                </div>
            </div>
        </div>
    )
}
