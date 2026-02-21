"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useCart } from "@/store/use-cart"
import { Button, PageHeader } from "@alvarosky/ui"
import { CheckCircle2, Clock, XCircle, Package, ShoppingBag } from "lucide-react"
import Link from "next/link"

type PaymentStatus = "approved" | "pending" | "rejected" | "unknown"

// Componente interno que usa useSearchParams
function StatusContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const cart = useCart()
    const [isMounted, setIsMounted] = useState(false)

    // Extraer parámetros de URL
    const collectionStatus = searchParams.get("collection_status") || searchParams.get("status")
    const externalReference = searchParams.get("external_reference") || searchParams.get("orderId")
    const paymentId = searchParams.get("payment_id")

    // Determinar estado normalizado
    const status: PaymentStatus =
        collectionStatus === "approved" ? "approved" :
            collectionStatus === "pending" || collectionStatus === "in_process" ? "pending" :
                collectionStatus === "rejected" || collectionStatus === "failure" ? "rejected" :
                    "unknown"

    // Limpiar carrito si pago aprobado
    useEffect(() => {
        if (status === "approved") {
            cart.clearCart()
        }
    }, [status, cart])



    return (
        <div className="container py-12">
            <div className="max-w-2xl mx-auto">
                {status === "approved" && (
                    <SuccessState
                        orderId={externalReference}
                        paymentId={paymentId}
                    />
                )}

                {status === "pending" && (
                    <PendingState
                        orderId={externalReference}
                        paymentId={paymentId}
                    />
                )}

                {status === "rejected" && (
                    <RejectedState />
                )}

                {status === "unknown" && (
                    <UnknownState />
                )}
            </div>
        </div>
    )
}

// Componente exportado con Suspense boundary
export default function StatusPage() {
    return (
        <Suspense fallback={
            <div className="container py-12">
                <div className="max-w-2xl mx-auto text-center">
                    <p className="text-muted-foreground">Cargando...</p>
                </div>
            </div>
        }>
            <StatusContent />
        </Suspense>
    )
}

// Estado: Pago Aprobado
function SuccessState({ orderId, paymentId }: { orderId: string | null, paymentId: string | null }) {
    return (
        <div className="text-center space-y-6">
            {/* Ícono de Éxito */}
            <div className="flex justify-center">
                <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-6">
                    <CheckCircle2 className="h-16 w-16 text-green-600 dark:text-green-400" />
                </div>
            </div>

            {/* Título */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-green-600 dark:text-green-400">
                    ¡Pago Exitoso!
                </h1>
                <p className="text-lg text-muted-foreground">
                    Tu compra ha sido procesada correctamente
                </p>
            </div>

            {/* Información de Orden */}
            <div className="bg-muted/50 rounded-lg p-6 space-y-2 text-sm">
                {orderId && (
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Número de Orden:</span>
                        <span className="font-mono font-semibold">{orderId}</span>
                    </div>
                )}
                {paymentId && (
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">ID de Pago:</span>
                        <span className="font-mono text-xs">{paymentId}</span>
                    </div>
                )}
            </div>

            {/* Mensaje */}
            <p className="text-muted-foreground">
                Recibirás un correo electrónico con los detalles de tu compra.
            </p>

            {/* Botones de Navegación */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                <Button size="lg" asChild>
                    <Link href="/dashboard/compras">
                        <Package className="mr-2 h-4 w-4" />
                        Ver mis Pedidos
                    </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                    <Link href="/tienda">
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        Volver a la Tienda
                    </Link>
                </Button>
            </div>
        </div>
    )
}

// Estado: Pago Pendiente
function PendingState({ orderId, paymentId }: { orderId: string | null, paymentId: string | null }) {
    return (
        <div className="text-center space-y-6">
            {/* Ícono de Espera */}
            <div className="flex justify-center">
                <div className="rounded-full bg-yellow-100 dark:bg-yellow-900/20 p-6">
                    <Clock className="h-16 w-16 text-yellow-600 dark:text-yellow-400" />
                </div>
            </div>

            {/* Título */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                    Pago en Proceso
                </h1>
                <p className="text-lg text-muted-foreground">
                    Tu pago está siendo procesado
                </p>
            </div>

            {/* Información de Orden */}
            {orderId && (
                <div className="bg-muted/50 rounded-lg p-6 space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Número de Orden:</span>
                        <span className="font-mono font-semibold">{orderId}</span>
                    </div>
                </div>
            )}

            {/* Mensaje */}
            <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/50 rounded-lg p-4 text-sm">
                <p className="text-muted-foreground">
                    Estamos esperando la confirmación de tu entidad bancaria.
                    Te notificaremos por correo electrónico cuando el pago sea confirmado.
                    Este proceso puede tomar hasta 48 horas.
                </p>
            </div>

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                <Button size="lg" asChild>
                    <Link href="/dashboard">
                        Ver mi Perfil
                    </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                    <Link href="/">
                        Volver al Inicio
                    </Link>
                </Button>
            </div>
        </div>
    )
}

// Estado: Pago Rechazado
function RejectedState() {
    return (
        <div className="text-center space-y-6">
            {/* Ícono de Error */}
            <div className="flex justify-center">
                <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-6">
                    <XCircle className="h-16 w-16 text-red-600 dark:text-red-400" />
                </div>
            </div>

            {/* Título */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-red-600 dark:text-red-400">
                    Pago No Completado
                </h1>
                <p className="text-lg text-muted-foreground">
                    No pudimos procesar tu pago
                </p>
            </div>

            {/* Mensaje */}
            <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 rounded-lg p-4 text-sm space-y-2">
                <p className="text-muted-foreground">
                    El pago fue rechazado por tu entidad bancaria o fue cancelado.
                </p>
                <p className="text-muted-foreground font-medium">
                    Posibles causas:
                </p>
                <ul className="text-left text-muted-foreground text-xs space-y-1 max-w-md mx-auto">
                    <li>• Fondos insuficientes</li>
                    <li>• Datos de tarjeta incorrectos</li>
                    <li>• Límite de compra excedido</li>
                    <li>• Cancelación manual del pago</li>
                </ul>
            </div>

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                <Button size="lg" asChild>
                    <Link href="/checkout">
                        Reintentar Pago
                    </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                    <Link href="/tienda">
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        Volver a la Tienda
                    </Link>
                </Button>
            </div>
        </div>
    )
}

// Estado: Desconocido (Fallback)
function UnknownState() {
    return (
        <div className="text-center space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold">
                    Estado Desconocido
                </h1>
                <p className="text-lg text-muted-foreground">
                    No pudimos determinar el estado de tu pago
                </p>
            </div>

            <p className="text-muted-foreground">
                Por favor, verifica tu correo o contacta con soporte.
            </p>

            <div className="flex gap-3 justify-center pt-4">
                <Button size="lg" asChild>
                    <Link href="/dashboard/compras">
                        Ver mis Pedidos
                    </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                    <Link href="/">
                        Volver al Inicio
                    </Link>
                </Button>
            </div>
        </div>
    )
}

