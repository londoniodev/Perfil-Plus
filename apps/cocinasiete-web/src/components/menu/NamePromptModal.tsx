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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white border border-slate-200 shadow-2xl rounded-2xl p-6 w-full max-w-sm"
            >
                <h3 className="text-xl font-bold text-slate-900 mb-2">Una cosa más...</h3>
                <p className="text-slate-500 text-sm mb-4">¿A nombre de quién registramos el pedido?</p>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tu nombre (Ej: Juan)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 mb-4 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors placeholder:text-slate-400 font-medium"
                    autoFocus
                />

                <p className="text-slate-500 text-sm mb-2 font-medium">Método de Pago</p>
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <button
                        onClick={() => setPaymentMethod("CASH")}
                        className={`py-3 rounded-xl font-medium border-2 transition-colors flex flex-col items-center justify-center gap-1 shadow-sm ${paymentMethod === "CASH"
                            ? "bg-primary/5 border-primary text-primary"
                            : "bg-white border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50"
                            }`}
                    >
                        <span>Efectivo</span>
                    </button>
                    <button
                        onClick={() => setPaymentMethod("MERCADOPAGO")}
                        className={`py-3 rounded-xl font-medium border-2 transition-colors flex flex-col items-center justify-center gap-1 shadow-sm ${paymentMethod === "MERCADOPAGO"
                            ? "bg-[#009EE3]/5 border-[#009EE3] text-[#009EE3]"
                            : "bg-white border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50"
                            }`}
                    >
                        <span>Transferencia</span>
                        <span className="text-[10px] opacity-70">(MercadoPago)</span>
                    </button>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl font-bold bg-slate-100 border border-slate-200 hover:bg-slate-200 hover:border-slate-300 text-slate-700 transition-colors shadow-sm"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => onConfirm(name, paymentMethod)}
                        disabled={!name.trim() || isSubmitting}
                        className="flex-1 py-3 rounded-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/25"
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
