import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, Copy, ArrowRight, Loader2, Package, ChefHat, Check } from "lucide-react"
import { useState, useEffect } from "react"
import { useOrder } from "@alvarosky/restaurant-sdk"
import { formatCurrency } from "@/lib/utils"

interface OrderTrackingModalProps {
    isOpen: boolean
    onClose: () => void
    orderId: string
    orderNumber: string
    slug: string
}

const statusSteps = [
    { key: "PENDING", label: "Pendiente", icon: Loader2, color: "text-yellow-500" },
    { key: "APPROVED", label: "Aprobado", icon: CheckCircle2, color: "text-blue-500" },
    { key: "PREPARING", label: "En Cocina", icon: ChefHat, color: "text-orange-500" },
    { key: "READY", label: "Listo", icon: Check, color: "text-green-500" },
    { key: "SERVED", label: "Servido", icon: Package, color: "text-slate-500" }
]

export function OrderTrackingModal({
    isOpen,
    onClose,
    orderId,
    orderNumber,
    slug
}: OrderTrackingModalProps) {
    const { trackOrder } = useOrder()
    const [order, setOrder] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        if (isOpen && orderId) {
            fetchOrder()
            const interval = setInterval(fetchOrder, 15000) // Poll every 15s
            return () => clearInterval(interval)
        }
    }, [isOpen, orderId])

    const fetchOrder = async () => {
        const data = await trackOrder(orderId, slug)
        if (data) setOrder(data)
        setLoading(false)
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(orderNumber)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    if (!isOpen) return null

    const currentStatus = order?.status || "PENDING"
    const statusIndex = statusSteps.findIndex(s => s.key === currentStatus)

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/40 backdrop-blur-sm p-0 sm:p-4">
                <motion.div
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "100%", opacity: 0 }}
                    className="bg-white border-t sm:border border-slate-200 shadow-2xl rounded-t-3xl sm:rounded-2xl p-6 w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]"
                >
                    <div className="flex justify-between items-start mb-6">
                        <div className="text-left">
                            <h3 className="text-xl font-bold text-slate-900">Seguimiento de Pedido</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm font-mono text-slate-500">#{orderNumber}</span>
                                <button onClick={handleCopy} className="text-slate-400 hover:text-primary">
                                    <Copy className="w-3.5 h-3.5" />
                                </button>
                                {copied && <span className="text-[10px] text-green-600 font-bold uppercase">Copiado</span>}
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <ArrowRight className="w-5 h-5 text-slate-400 rotate-90 sm:rotate-0" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-8 py-4">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-10 gap-4">
                                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                                <p className="text-sm text-slate-500 font-medium">Cargando estado...</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Status Progress Bar */}
                                <div className="relative pl-8 space-y-8 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                                    {statusSteps.map((step, idx) => {
                                        const isCompleted = idx <= statusIndex
                                        const isCurrent = idx === statusIndex
                                        const Icon = step.icon

                                        return (
                                            <div key={step.key} className={`relative flex items-center gap-4 transition-all ${isCompleted ? 'opacity-100' : 'opacity-40'}`}>
                                                <div className={`absolute -left-[33px] w-[34px] h-[34px] rounded-full flex items-center justify-center border-4 border-white shadow-sm z-10 ${isCompleted ? 'bg-primary text-white scale-110' : 'bg-slate-200 text-slate-500'}`}>
                                                    <Icon className={isCurrent && step.key === "PENDING" ? "animate-spin w-4 h-4" : "w-4 h-4"} />
                                                </div>
                                                <div>
                                                    <p className={`text-sm font-bold ${isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>
                                                        {step.label}
                                                    </p>
                                                    {isCurrent && (
                                                        <p className="text-xs text-primary font-medium mt-0.5">
                                                            Tu pedido está aquí
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* Order Summary Mini */}
                                {order?.items && (
                                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Resumen</h4>
                                        <div className="space-y-2">
                                            {order.items.slice(0, 3).map((item: any) => (
                                                <div key={item.id} className="flex justify-between text-sm">
                                                    <span className="text-slate-600">{item.quantity}x {item.productName}</span>
                                                    <span className="text-slate-900 font-medium">{formatCurrency(Number(item.price) * item.quantity)}</span>
                                                </div>
                                            ))}
                                            {order.items.length > 3 && (
                                                <p className="text-xs text-slate-400 text-center mt-2 px-2 italic">
                                                    + {order.items.length - 3} items más
                                                </p>
                                            )}
                                        </div>
                                        <div className="border-t border-slate-200 mt-3 pt-3 flex justify-between font-bold text-slate-900">
                                            <span>Total</span>
                                            <span className="text-primary">{formatCurrency(order.totalAmount)}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="pt-6">
                        <button
                            onClick={onClose}
                            className="w-full py-4 rounded-2xl font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                        >
                            ¡Entendido!
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
