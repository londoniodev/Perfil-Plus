"use client"

import { useState } from "react"
import { motion } from "framer-motion"

export function NamePromptModal({
    isOpen,
    onClose,
    onConfirm,
    isSubmitting
}: {
    isOpen: boolean
    onClose: () => void
    onConfirm: (name: string, paymentMethod: "CASH" | "MERCADOPAGO") => void
    isSubmitting: boolean
}) {
    const [name, setName] = useState("")
    const [paymentMethod, setPaymentMethod] = useState<"CASH" | "MERCADOPAGO">("CASH")

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-[#221810] border border-white/10 rounded-2xl p-6 w-full max-w-sm"
            >
                <h3 className="text-xl font-bold text-white mb-2">Una cosa más...</h3>
                <p className="text-gray-400 text-sm mb-4">¿A nombre de quién registramos el pedido?</p>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tu nombre (Ej: Juan)"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white mb-4 focus:outline-none focus:border-[#ec6d13]"
                    autoFocus
                />

                <p className="text-gray-400 text-sm mb-2">Método de Pago</p>
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <button
                        onClick={() => setPaymentMethod("CASH")}
                        className={`py-3 rounded-xl font-medium border transition-colors flex flex-col items-center justify-center gap-1 ${paymentMethod === "CASH"
                                ? "bg-white/10 border-[#ec6d13] text-[#ec6d13]"
                                : "bg-white/5 border-transparent text-gray-400 hover:text-white"
                            }`}
                    >
                        <span>Efectivo</span>
                    </button>
                    <button
                        onClick={() => setPaymentMethod("MERCADOPAGO")}
                        className={`py-3 rounded-xl font-medium border transition-colors flex flex-col items-center justify-center gap-1 ${paymentMethod === "MERCADOPAGO"
                                ? "bg-white/10 border-[#009EE3] text-[#009EE3]"
                                : "bg-white/5 border-transparent text-gray-400 hover:text-white"
                            }`}
                    >
                        <span>Transferencia</span>
                        <span className="text-[10px] opacity-70">(MercadoPago)</span>
                    </button>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl font-medium bg-white/5 hover:bg-white/10 text-white transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => onConfirm(name, paymentMethod)}
                        disabled={!name.trim() || isSubmitting}
                        className="flex-1 py-3 rounded-xl font-semibold bg-[#ec6d13] hover:bg-[#d55f0e] text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Enviando...
                            </>
                        ) : (
                            "Confirmar"
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    )
}
