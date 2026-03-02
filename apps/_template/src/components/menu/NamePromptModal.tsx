"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { User, Phone, MapPin, CreditCard, Banknote, X } from "lucide-react"

export function NamePromptModal({
    isOpen,
    onClose,
    onConfirm,
    isSubmitting,
    isTableOrder = false
}: {
    isOpen: boolean
    onClose: () => void
    onConfirm: (data: { name: string; phone: string; address?: string; paymentMethod: "CASH" | "MERCADOPAGO" }) => void
    isSubmitting: boolean
    isTableOrder?: boolean
}) {
    const [name, setName] = useState("")
    const [phone, setPhone] = useState("")
    const [address, setAddress] = useState("")
    const [paymentMethod, setPaymentMethod] = useState<"CASH" | "MERCADOPAGO">("CASH")

    // Cargar datos desde localStorage al abrir el modal
    useEffect(() => {
        if (isOpen && typeof window !== "undefined") {
            const saved = localStorage.getItem("customer_info")
            if (saved) {
                try {
                    const data = JSON.parse(saved)
                    if (data.name && !name) setName(data.name)
                    if (data.phone && !phone) setPhone(data.phone)
                    if (data.address && !address) setAddress(data.address)
                } catch (e) {
                    console.error("Error parsing customer_info", e)
                }
            }
        }
    }, [isOpen])

    if (!isOpen) return null

    const handleConfirm = () => {
        const data = {
            name,
            phone,
            address: isTableOrder ? undefined : address,
            paymentMethod
        }

        // Persistir en localStorage
        localStorage.setItem("customer_info", JSON.stringify({ name, phone, address }))

        onConfirm(data)
    }

    const isValid = name.trim() !== "" && phone.trim() !== "" && (isTableOrder || address.trim() !== "")

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-white border border-slate-200 shadow-2xl rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-md overflow-hidden"
            >
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 leading-tight">Datos de Entrega</h3>
                        <p className="text-slate-500 text-sm">Confirma tus datos para procesar el pedido</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
                        aria-label="Cerrar"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="space-y-4 mb-6">
                    {/* Nombre */}
                    <div className="space-y-1.5">
                        <label htmlFor="customer-name" className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Nombre Completo</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                id="customer-name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Ej: Juan Pérez"
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Teléfono */}
                    <div className="space-y-1.5">
                        <label htmlFor="customer-phone" className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Celular / WhatsApp</label>
                        <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                id="customer-phone"
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="Ej: 300 123 4567"
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                            />
                        </div>
                    </div>

                    {/* Dirección (Solo si no es mesa) */}
                    {!isTableOrder && (
                        <div className="space-y-1.5">
                            <label htmlFor="customer-address" className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Dirección de Entrega</label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    id="customer-address"
                                    type="text"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="Ej: Calle 10 #20-30, Apto 401"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-3 mb-8">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Método de Pago</label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => setPaymentMethod("CASH")}
                            className={`px-4 py-4 rounded-2xl font-bold border-2 transition-all flex items-center justify-center gap-2 shadow-sm ${paymentMethod === "CASH"
                                ? "bg-primary/5 border-primary text-primary"
                                : "bg-white border-slate-100 text-slate-400 hover:text-slate-600 hover:border-slate-200"
                                }`}
                        >
                            <Banknote className="w-5 h-5" />
                            Efectivo
                        </button>
                        <button
                            onClick={() => setPaymentMethod("MERCADOPAGO")}
                            className={`px-4 py-4 rounded-2xl font-bold border-2 transition-all flex flex-col items-center justify-center leading-tight shadow-sm ${paymentMethod === "MERCADOPAGO"
                                ? "bg-[#009EE3]/5 border-[#009EE3] text-[#009EE3]"
                                : "bg-white border-slate-100 text-slate-400 hover:text-slate-600 hover:border-slate-200"
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <CreditCard className="w-5 h-5" />
                                Transferencia
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-tighter opacity-70">MercadoPago</span>
                        </button>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleConfirm}
                        disabled={!isValid || isSubmitting}
                        className="flex-1 py-4 rounded-2xl font-black text-lg bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-xl shadow-primary/20"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                PROCESANDO...
                            </>
                        ) : (
                            "CONFIRMAR PEDIDO"
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    )
}
