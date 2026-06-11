"use client"

import { useState } from "react"
import { DataTable } from "../data-table"
import { Badge } from "../../badge"
import { PriceDisplay } from "../../price-display"
import { Button } from "../../button"
import { OrderDetailsSheet, OrderData } from "./order-details-sheet"
import { ColumnDef } from "@tanstack/react-table"

// ============================================
// Types
// ============================================

export interface OrdersTableProps {
    orders: OrderData[]
    /** Callback to update order status. Should return { success: boolean, error?: string } */
    onStatusChange?: (orderId: string, newStatus: string) => Promise<{ success: boolean; error?: string }>
}

// ============================================
// Status Config
// ============================================

const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; variant: any }> = {
        PENDING: { label: "Pendiente", variant: "secondary" },
        APPROVED: { label: "Aprobado", variant: "default" },
        PROCESSING: { label: "En Preparación", variant: "secondary" },
        SHIPPED: { label: "Enviado", variant: "default" },
        DELIVERED: { label: "Entregado", variant: "default" },
        CANCELLED: { label: "Cancelado", variant: "destructive" },
        REFUNDED: { label: "Reembolsado", variant: "outline" }
    }
    return configs[status] || { label: status, variant: "outline" }
}

// ============================================
// OrdersTable Component
// ============================================

export function OrdersTable({ orders, onStatusChange }: OrdersTableProps) {
    const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null)
    const [sheetOpen, setSheetOpen] = useState(false)

    const handleViewDetails = (order: OrderData) => {
        setSelectedOrder(order)
        setSheetOpen(true)
    }

    // Transformar datos para DataTable
    const tableData = orders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.shippingData?.name || order.user?.name || "N/A",
        customerEmail: order.shippingData?.email || order.user?.email || "N/A",
        status: order.status,
        totalAmount: Number(order.totalAmount),
        itemsCount: order.items?.length || 0,
        createdAt: order.createdAt,
        fullOrder: order
    }))

    type TableItem = typeof tableData[0]

    const columns: ColumnDef<TableItem>[] = [
        {
            accessorKey: "orderNumber",
            header: "Número",
            cell: (row: any) => (
                <div className="font-mono text-sm font-medium">
                    {row.getValue()}
                </div>
            )
        },
        {
            accessorKey: "customerName",
            header: "Cliente",
            cell: (row: any) => {
                const data = row.row.original
                return (
                    <div>
                        <div className="font-medium">{data.customerName}</div>
                        <div className="text-xs text-muted-foreground">{data.customerEmail}</div>
                    </div>
                )
            }
        },
        {
            accessorKey: "status",
            header: "Estado",
            cell: (row: any) => {
                const config = getStatusConfig(row.getValue())
                return (
                    <Badge variant={config.variant}>
                        {config.label}
                    </Badge>
                )
            }
        },
        {
            accessorKey: "totalAmount",
            header: "Total",
            cell: (row: any) => (
                <PriceDisplay price={row.getValue()} size="sm" />
            )
        },
        {
            accessorKey: "itemsCount",
            header: "Items",
            cell: (row: any) => (
                <span className="text-sm">
                    {row.getValue()} {row.getValue() === 1 ? "producto" : "productos"}
                </span>
            )
        },
        {
            accessorKey: "createdAt",
            header: "Fecha",
            cell: (row: any) => (
                <span className="text-sm">
                    {new Date(row.getValue()).toLocaleDateString("es-ES")}
                </span>
            )
        },
        {
            id: "actions",
            header: "Acciones",
            cell: ({ row }: any) => (
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewDetails(row.original.fullOrder)}
                >
                    Ver Detalles
                </Button>
            )
        }
    ]

    return (
        <>
            <DataTable data={tableData} columns={columns} />

            <OrderDetailsSheet
                order={selectedOrder}
                open={sheetOpen}
                onOpenChange={setSheetOpen}
                onStatusChange={onStatusChange}
            />
        </>
    )
}
