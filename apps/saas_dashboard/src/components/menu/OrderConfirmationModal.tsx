import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, Copy } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export function OrderConfirmationModal({
    isOpen,
    onClose,
    orderId,
    orderNumber
}: {
    isOpen: boolean
    onClose: () => void
    orderId: string
    orderNumber: string
}) {
    const [copied, setCopied] = useState(false)

    if (!isOpen) return null

    const handleCopy = () => {
        navigator.clipboard.writeText(orderNumber)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white border border-slate-200 shadow-2xl rounded-2xl p-6 w-full max-w-sm text-center"
                >
                    <div className="flex justify-center mb-4">
                        <CheckCircle2 className="w-16 h-16 text-green-500" />
                    </div>

                    <h3 className="text-2xl font-bold text-slate-900 mb-2">¡Pedido creado!</h3>
                    <p className="text-slate-500 mb-6">Tu orden ha sido registrada exitosamente.</p>

                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
                        <p className="text-sm text-slate-500 font-medium mb-1">Código de tu pedido</p>
                        <div className="flex items-center justify-center gap-2">
                            <span className="text-2xl font-black text-slate-900 tracking-wider">
                                {orderNumber}
                            </span>
                            <button
                                onClick={handleCopy}
                                className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-500"
                                title="Copiar código"
                            >
                                <Copy className="w-5 h-5" />
                            </button>
                        </div>
                        {copied && <span className="text-xs text-green-600 font-medium mt-1 block">¡Copiado!</span>}
                    </div>

                    <div className="mb-6">
                        <Link
                            href={`/mi_pedido/${orderId}`}
                            className="text-primary font-bold hover:underline"
                        >
                            Aquí puedes ver el estado de tu pedido
                        </Link>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full py-3 rounded-xl font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    >
                        Cerrar
                    </button>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
