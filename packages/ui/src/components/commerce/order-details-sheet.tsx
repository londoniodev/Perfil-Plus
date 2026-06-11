"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../../sheet"
import { Badge } from "../../badge"
import { PriceDisplay } from "../../price-display"
import { AdaptiveImage } from "../../adaptive-image"
import { useToast } from "../../toast"
import { Package, MapPin, Phone, Mail, User } from "lucide-react"

// ============================================
// Types
// ============================================

export interface OrderShippingData {
    name?: string
    email?: string
    address?: string
    city?: string
    phone?: string
    lat?: number | string
    lng?: number | string
}

export interface OrderUser {
    name?: string | null
    email?: string | null
}

export interface OrderItemData {
    id: string
    quantity: number
    price: number | any
    variant?: {
        name?: string
        product?: {
            name?: string
            images?: string[]
        }
    }
}

export interface OrderData {
    id: string
    orderNumber: string
    status: string
    totalAmount: number | any
    createdAt: Date | string
    user?: OrderUser | null
    shippingData?: OrderShippingData | any
    items?: OrderItemData[]
}

export interface OrderDetailsSheetProps {
    order: OrderData | null
    open: boolean
    onOpenChange: (open: boolean) => void
    /** Callback to update order status. Should return { success: boolean, error?: string } */
    onStatusChange?: (orderId: string, newStatus: string) => Promise<{ success: boolean; error?: string }>
}

const STATUS_OPTIONS = [
    { value: "PENDING", label: "Pendiente", color: "secondary" },
    { value: "APPROVED", label: "Aprobado", color: "default" },
    { value: "PROCESSING", label: "En Preparación", color: "secondary" },
    { value: "SHIPPED", label: "Enviado", color: "default" },
    { value: "DELIVERED", label: "Entregado", color: "default" },
    { value: "CANCELLED", label: "Cancelado", color: "destructive" },
    { value: "REFUNDED", label: "Reembolsado", color: "outline" }
]

export function OrderDetailsSheet({ order, open, onOpenChange, onStatusChange }: OrderDetailsSheetProps) {
    const toast = useToast()
    const [isUpdating, setIsUpdating] = useState(false)
    const [currentStatus, setCurrentStatus] = useState(order?.status || "PENDING")

    const handleStatusChange = async (newStatus: string) => {
        if (!order || !onStatusChange) return

        setIsUpdating(true)
        try {
            const result = await onStatusChange(order.id, newStatus)

            if (result.success) {
                setCurrentStatus(newStatus)
                toast.success("Estado actualizado exitosamente")
            } else {
                toast.error(result.error || "Error al actualizar estado")
            }
        } catch (error) {
            toast.error("Error al procesar la solicitud")
        } finally {
            setIsUpdating(false)
        }
    }

    if (!order) return null

    const shippingData = order.shippingData || {}
    const currentStatusConfig = STATUS_OPTIONS.find(s => s.value === currentStatus)

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Orden {order.orderNumber}</SheetTitle>
                </SheetHeader>

                <div className="space-y-6 mt-6">
                    {/* Estado y Selector */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold">Estado de la Orden</h3>
                            {currentStatusConfig && (
                                <Badge variant={currentStatusConfig.color as any}>
                                    {currentStatusConfig.label}
                                </Badge>
                            )}
                        </div>

                        {onStatusChange && (
                            <select
                                value={currentStatus}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                disabled={isUpdating}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                            >
                                {STATUS_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Información del Cliente */}
                    <div className="space-y-3 border-t pt-4">
                        <h3 className="font-semibold">Cliente</h3>

                        <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span>{shippingData.name || order.user?.name || "N/A"}</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span>{order.user?.email || shippingData.email || "N/A"}</span>
                            </div>

                            {shippingData.phone && (
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span>{shippingData.phone}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Datos de Envío */}
                    {shippingData.address && (
                        <div className="space-y-3 border-t pt-4">
                            <h3 className="font-semibold">Dirección de Envío</h3>

                            <div className="space-y-2 text-sm">
                                <div className="flex items-start gap-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p>{shippingData.address}</p>
                                        <p className="text-muted-foreground">{shippingData.city}</p>
                                        {shippingData.lat && shippingData.lng && (
                                            <a
                                                href={`https://www.google.com/maps/search/?api=1&query=${shippingData.lat},${shippingData.lng}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-primary hover:underline mt-2 block font-medium"
                                            >
                                                📍 Ver en Google Maps
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Productos */}
                    <div className="space-y-3 border-t pt-4">
                        <h3 className="font-semibold">Productos</h3>

                        <div className="space-y-3">
                            {order.items?.map((item) => (
                                <div key={item.id} className="flex gap-3 p-3 border rounded-lg">
                                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded border">
                                        <AdaptiveImage
                                            src={item.variant?.product?.images?.[0] || "/placeholder.jpg"}
                                            aspectRatio="square"
                                            alt={item.variant?.product?.name || "Producto"}
                                        />
                                    </div>

                                    <div className="flex-1 space-y-1">
                                        <h4 className="font-medium text-sm">
                                            {item.variant?.product?.name || "Producto"}
                                        </h4>
                                        {item.variant?.name && (
                                            <p className="text-xs text-muted-foreground">
                                                {item.variant.name}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-4 text-sm">
                                            <span className="text-muted-foreground">
                                                Cantidad: {item.quantity}
                                            </span>
                                            <PriceDisplay price={Number(item.price)} size="sm" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Total */}
                    <div className="border-t pt-4">
                        <div className="flex items-center justify-between text-lg font-bold">
                            <span>Total</span>
                            <PriceDisplay price={Number(order.totalAmount)} size="lg" />
                        </div>
                    </div>

                    {/* Fecha */}
                    <div className="text-sm text-muted-foreground border-t pt-4">
                        <p>Creada: {new Date(order.createdAt).toLocaleDateString("es-ES", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                        })}</p>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
