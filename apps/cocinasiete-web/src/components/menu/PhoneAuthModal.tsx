"use client"

import { useState } from "react"
import { motion } from "framer-motion"

export function PhoneAuthModal({
    isOpen,
    onClose,
    onSuccess
}: {
    isOpen: boolean
    onClose: () => void
    onSuccess: (phone: string) => void
}) {
    const [phone, setPhone] = useState("")

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-[#221810] border border-white/10 rounded-2xl p-6 w-full max-w-sm"
            >
                <h3 className="text-xl font-bold text-white mb-2">Verifica tu celular</h3>
                <p className="text-gray-400 text-sm mb-4">Para dar like o comentar, necesitamos validar que eres una persona real.</p>
                <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Tu número (Ej: 0991234567)"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white mb-6 focus:outline-none focus:border-[#ec6d13]"
                    autoFocus
                />
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl font-medium bg-white/5 hover:bg-white/10 text-white transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => {
                            if (phone.length >= 8) onSuccess(phone)
                        }}
                        disabled={phone.length < 8}
                        className="flex-1 py-3 rounded-xl font-semibold bg-[#ec6d13] hover:bg-[#d55f0e] text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Continuar
                    </button>
                </div>
            </motion.div>
        </div>
    )
}
