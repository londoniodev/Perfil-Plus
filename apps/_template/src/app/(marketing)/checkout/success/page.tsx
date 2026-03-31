"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { CheckCircle } from "lucide-react"
import { Button } from "@alvarosky/ui"
import { useCart } from "@/store/use-cart"
import { motion } from "framer-motion"
import { useTenant } from "@/app/providers"

export default function CheckoutSuccessPage() {
    const { clearCart } = useCart()
    const { features } = useTenant()
    const isCleared = useRef(false)

    const isRestaurant = features.map(f => f.toUpperCase()).includes("RESTAURANT")
    const returnHref = isRestaurant ? "/menu" : "/tienda"
    const returnLabel = isRestaurant ? "Volver al Menú" : "Volver a la Tienda"
    const description = isRestaurant
        ? "Tu pedido ha sido recibido y está siendo procesado. Pronto comenzaremos a prepararlo."
        : "Tu compra se ha procesado correctamente. Si adquiriste un producto digital, revisa tu correo electrónico para acceder al contenido. Si es un producto físico, comenzaremos a preparar tu envío pronto."

    useEffect(() => {
        if (!isCleared.current) {
            clearCart()
            isCleared.current = true
        }
    }, [clearCart])

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 sm:p-12 text-center border border-slate-100"
            >
                <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                    <CheckCircle className="w-12 h-12 text-green-600" aria-hidden="true" />
                </div>

                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-4">
                    ¡Pago Exitoso!
                </h1>

                <p className="text-slate-500 mb-8 leading-relaxed">
                    {description}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button asChild className="w-full sm:w-auto h-12 px-8 rounded-full shadow-lg shadow-primary/25 font-bold">
                        <Link href={returnHref}>
                            {returnLabel}
                        </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full sm:w-auto h-12 px-8 rounded-full font-bold text-slate-700">
                        <Link href="/">
                            Ir al Inicio
                        </Link>
                    </Button>
                </div>
            </motion.div>
        </div>
    )
}
