"use client"

import { Suspense } from "react"
import { useSearchParams, useRouter, notFound } from "next/navigation"
import { Button } from "@alvarosky/ui"
import { CheckCircle2 } from "lucide-react"
import { useTenant } from "@/app/providers"

function OrderConfirmationContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const { isRestaurant, isShop: isEcommerce } = useTenant()
    const orderId = searchParams.get("orderId")

    if (!isRestaurant && !isEcommerce) {
        return notFound()
    }

    return (
        <div className="container py-24 flex flex-col items-center text-center">
            <div className="bg-green-100 text-green-600 rounded-full p-4 mb-6">
                <CheckCircle2 className="h-12 w-12" />
            </div>

            <h1 className="text-3xl font-bold mb-2">¡{isRestaurant ? "Pedido" : "Compra"} Confirmad{isRestaurant ? "o" : "a"}!</h1>
            <p className="text-muted-foreground mb-8 text-lg max-w-md">
                Tu {isRestaurant ? "orden" : "compra"} {orderId ? `#${orderId.slice(-6).toUpperCase()}` : ""} ha sido procesada con éxito.
            </p>

            <div className="space-y-4">
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {isRestaurant ? (
                        "Si estás en una mesa, tu pedido llegará pronto.\nSi es para llevar o domicilio, te notificaremos cuando esté listo."
                    ) : (
                        "Te enviaremos un correo con los detalles de tu pedido i seguimiento pronto."
                    )}
                </p>

                <div className="flex gap-4 justify-center mt-6">
                    <Button onClick={() => router.push(isRestaurant ? "/menu" : "/tienda")} size="lg">
                        {isRestaurant ? "Volver al Menú" : "Volver a la Tienda"}
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
