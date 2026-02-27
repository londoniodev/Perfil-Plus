"use client"

import Link from "next/link"
import { XCircle, RefreshCcw } from "lucide-react"
import { Button } from "@alvarosky/ui"
import { motion } from "framer-motion"

export default function CheckoutFailurePage() {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 sm:p-12 text-center border border-slate-100"
            >
                <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                    <XCircle className="w-12 h-12 text-red-600" />
                </div>

                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-4">
                    Pago Rechazado
                </h1>

                <p className="text-slate-500 mb-8 leading-relaxed">
                    Ups, hubo un problema procesando tu pago. Tranquilo, no se ha realizado ningún cargo a tu medio de pago y tu carrito sigue intacto.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button asChild className="w-full sm:w-auto h-12 px-8 rounded-full shadow-lg shadow-primary/25 font-bold">
                        <Link href="/tienda">
                            <RefreshCcw className="w-5 h-5 mr-2" />
                            Intentar de nuevo
                        </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full sm:w-auto h-12 px-8 rounded-full font-bold text-slate-700">
                        <Link href="/">
                            Cancelar
                        </Link>
                    </Button>
                </div>
            </motion.div>
        </div>
    )
}
