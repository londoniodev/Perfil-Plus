"use client"

import { Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@alvarosky/ui"
import { CheckCircle2 } from "lucide-react"

function OrderConfirmationContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const orderId = searchParams.get("orderId")

    return (
        <div className="container py-24 flex flex-col items-center text-center">
            <div className="bg-green-100 text-green-600 rounded-full p-4 mb-6">
                <CheckCircle2 className="h-12 w-12" />
            </div>

            <h1 className="text-3xl font-bold mb-2">¡Pedido Recibido!</h1>
            <p className="text-muted-foreground mb-8 text-lg max-w-md">
                Tu orden {orderId ? `#${orderId.slice(-6).toUpperCase()}` : ""} ha sido enviada exitosamente a cocina.
            </p>

            <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                    Si estás en una mesa, tu pedido llegará pronto.
                    <br />
                    Si es para llevar o domicilio, te notificaremos cuando esté listo.
                </p>

                <div className="flex gap-4 justify-center mt-6">
                    <Button onClick={() => router.push("/menu")} size="lg">
                        Volver al Menú
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default function OrderConfirmationPage() {
    return (
        <Suspense fallback={
            <div className="container py-24 text-center">
                <p className="text-muted-foreground">Cargando confirmación...</p>
            </div>
        }>
            <OrderConfirmationContent />
        </Suspense>
    )
}
