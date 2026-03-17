"use client"

import { useState } from "react"
import { OrderStatus } from "@alvarosky/database"
import { updateOrderStatus } from "@/actions/admin/orders"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Badge } from "@alvarosky/ui"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface OrderStatusBadgeProps {
    order: any
}

// Mapa de colores predefinido
const statusColors: Record<OrderStatus, string> = {
    PENDING: "bg-yellow-500",
    APPROVED: "bg-green-500",
    PROCESSING: "bg-blue-500",
    PREPARING: "bg-orange-500",
    READY: "bg-teal-500",
    SERVED: "bg-purple-500",
    ASSIGNED: "bg-blue-600",
    IN_TRANSIT: "bg-indigo-600",
    SHIPPED: "bg-indigo-500",
    DELIVERED: "bg-gray-800",
    CANCELLED: "bg-red-500",
    REFUNDED: "bg-pink-500"
}

// Mapa de labels
const statusLabels: Record<OrderStatus, string> = {
    PENDING: "Pendiente",
    APPROVED: "Aprobado",
    PROCESSING: "Procesando",
    PREPARING: "En Cocina",
    READY: "Listo",
    SERVED: "Servido",
    ASSIGNED: "Asignado a Repartidor",
    IN_TRANSIT: "En Camino",
    SHIPPED: "Enviado",
    DELIVERED: "Entregado",
    CANCELLED: "Cancelado",
    REFUNDED: "Reembolsado"
}

export default function OrderStatusBadge({ order }: OrderStatusBadgeProps) {
    const [isLoading, setIsLoading] = useState(false)

    // Inferir tipo principal iterando items
    const hasDigital = order.items.some((i: any) => i.variant?.product?.productType === "DIGITAL")
    const hasFood = order.items.some((i: any) => i.variant?.product?.productType === "RESTAURANT") || order.orderType === "DINE_IN"
    const hasPhysical = order.items.some((i: any) => i.variant?.product?.productType === "PHYSICAL")

    let allowedStatuses: OrderStatus[] = []
    let isReadOnly = false

    if (hasDigital && !hasPhysical && !hasFood) {
        isReadOnly = true
    } else if (hasFood) {
        allowedStatuses = ["PREPARING", "READY", "SERVED", "CANCELLED"]
    } else if (hasPhysical) {
        allowedStatuses = ["PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]
    } else {
        allowedStatuses = ["PENDING", "APPROVED", "DELIVERED", "CANCELLED"]
    }

    // Asegurar que el estado actual siempre esté en la lista permitida para no romper el select
    if (!isReadOnly && !allowedStatuses.includes(order.status)) {
        allowedStatuses = [order.status as OrderStatus, ...allowedStatuses]
    }

    const handleChange = async (newStatus: OrderStatus) => {
        setIsLoading(true)
        const res = await updateOrderStatus(order.id, newStatus)
        setIsLoading(false)

        if (res.success) {
            toast.success(`Estado actualizado a ${statusLabels[newStatus]}`)
        } else {
            toast.error(res.error || "No se pudo actualizar el estado")
        }
    }

    if (isReadOnly) {
        return (
            <Badge className={`${statusColors[order.status as OrderStatus]} text-white pointer-events-none`}>
                {statusLabels[order.status as OrderStatus] || order.status}
            </Badge>
        )
    }

    return (
        <div className="flex items-center gap-2">
            {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground shrink-0" />}
            <Select
                defaultValue={order.status}
                onValueChange={(val) => handleChange(val as OrderStatus)}
                disabled={isLoading}
            >
                <SelectTrigger className={`w-[130px] h-8 text-xs font-semibold text-white border-0 ${statusColors[order.status as OrderStatus]}`}>
                    <SelectValue placeholder="Estado..." />
                </SelectTrigger>
                <SelectContent>
                    {allowedStatuses.map(status => (
                        <SelectItem key={status} value={status}>
                            {statusLabels[status]}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}
