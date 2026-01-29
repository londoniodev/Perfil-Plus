"use client"

import { useState } from "react"
import Image from "next/image"
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Badge,
    Button,
    Input,
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    Separator,
    PriceDisplay,
    Avatar,
    AvatarFallback,
} from "@alvarosky/ui"
import { Search, ChevronLeft, ChevronRight, Eye, ArrowUpDown, Package, Mail } from "lucide-react"
import { cn } from "@alvarosky/ui/lib/utils"

// ============================================
// Types
// ============================================
interface OrderItem {
    name: string
    image: string
    quantity: number
    price: number
    type: string
}

export interface OrderTableData {
    id: string
    orderNumber: string
    customerName: string
    customerEmail: string
    status: string
    paymentStatus: string
    total: number
    itemCount: number
    items: OrderItem[]
    createdAt: Date
}

interface OrdersTableClientProps {
    data: OrderTableData[]
}

// ============================================
// Status Badges
// ============================================
const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
    PENDING: { label: "Pendiente", variant: "secondary" },
    PROCESSING: { label: "Procesando", variant: "default" },
    SHIPPED: { label: "Enviado", variant: "default" },
    DELIVERED: { label: "Entregado", variant: "default" },
    COMPLETED: { label: "Completado", variant: "default" },
    CANCELLED: { label: "Cancelado", variant: "destructive" },
}

const paymentConfig: Record<string, { label: string; className: string }> = {
    PENDING: { label: "Pendiente", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
    APPROVED: { label: "Aprobado", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
    REJECTED: { label: "Rechazado", className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
    REFUNDED: { label: "Reembolsado", className: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300" },
}

// ============================================
// Column Definitions
// ============================================
function getColumns(onView: (order: OrderTableData) => void): ColumnDef<OrderTableData>[] {
    return [
        {
            accessorKey: "orderNumber",
            header: "Orden",
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono text-sm font-medium">#{row.original.orderNumber}</span>
                </div>
            ),
        },
        {
            accessorKey: "customerName",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="-ml-4 h-8"
                >
                    Cliente
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {row.original.customerName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="font-medium text-sm">{row.original.customerName}</span>
                        <span className="text-xs text-muted-foreground">{row.original.customerEmail}</span>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: "itemCount",
            header: "Items",
            cell: ({ row }) => (
                <span className="text-sm">{row.original.itemCount} producto(s)</span>
            ),
        },
        {
            accessorKey: "total",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="-ml-4 h-8"
                >
                    Total
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <PriceDisplay price={row.original.total} size="sm" />,
        },
        {
            accessorKey: "paymentStatus",
            header: "Pago",
            cell: ({ row }) => {
                const config = paymentConfig[row.original.paymentStatus] || paymentConfig.PENDING
                return (
                    <Badge variant="outline" className={cn("border-0", config.className)}>
                        {config.label}
                    </Badge>
                )
            },
        },
        {
            accessorKey: "status",
            header: "Estado",
            cell: ({ row }) => {
                const config = statusConfig[row.original.status] || statusConfig.PENDING
                return <Badge variant={config.variant}>{config.label}</Badge>
            },
        },
        {
            accessorKey: "createdAt",
            header: "Fecha",
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground">
                    {new Date(row.original.createdAt).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                    })}
                </span>
            ),
        },
        {
            id: "actions",
            cell: ({ row }) => (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onView(row.original)}
                    className="h-8 w-8 p-0"
                >
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">Ver detalles</span>
                </Button>
            ),
        },
    ]
}

// ============================================
// Main Component
// ============================================
export function OrdersTableClient({ data }: OrdersTableClientProps) {
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [globalFilter, setGlobalFilter] = useState("")
    const [selectedOrder, setSelectedOrder] = useState<OrderTableData | null>(null)
    const [isSheetOpen, setIsSheetOpen] = useState(false)

    const handleView = (order: OrderTableData) => {
        setSelectedOrder(order)
        setIsSheetOpen(true)
    }

    const columns = getColumns(handleView)

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn: "includesString",
        state: {
            sorting,
            columnFilters,
            globalFilter,
        },
        initialState: {
            pagination: { pageSize: 10 },
        },
    })

    return (
        <>
            <div className="space-y-4">
                {/* Search */}
                <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Buscar órdenes..."
                            value={globalFilter}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {table.getFilteredRowModel().rows.length} orden(es)
                    </p>
                </div>

                {/* Table */}
                <div className="rounded-lg border bg-card overflow-hidden">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id} className="h-11">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id} className="transition-colors">
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id} className="py-3">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                                        No se encontraron órdenes.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
                    </p>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                            className="h-8 w-8 p-0"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                            className="h-8 w-8 p-0"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Order Details Sheet */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="sm:max-w-lg overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle>Orden #{selectedOrder?.orderNumber}</SheetTitle>
                        <SheetDescription>Detalles completos de la orden</SheetDescription>
                    </SheetHeader>

                    {selectedOrder && (
                        <div className="mt-6 space-y-6">
                            {/* Customer Info */}
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium text-muted-foreground">Cliente</h4>
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                    <Avatar>
                                        <AvatarFallback>
                                            {selectedOrder.customerName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">{selectedOrder.customerName}</p>
                                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                                            <Mail className="h-3 w-3" /> {selectedOrder.customerEmail}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Status */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Estado</p>
                                    <Badge variant={statusConfig[selectedOrder.status]?.variant || "secondary"}>
                                        {statusConfig[selectedOrder.status]?.label || selectedOrder.status}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Pago</p>
                                    <Badge variant="outline" className={cn("border-0", paymentConfig[selectedOrder.paymentStatus]?.className)}>
                                        {paymentConfig[selectedOrder.paymentStatus]?.label || selectedOrder.paymentStatus}
                                    </Badge>
                                </div>
                            </div>

                            <Separator />

                            {/* Items */}
                            <div className="space-y-3">
                                <h4 className="text-sm font-medium text-muted-foreground">Productos ({selectedOrder.itemCount})</h4>
                                {selectedOrder.items.map((item, index) => (
                                    <div key={index} className="flex items-center gap-3 p-2 rounded-lg border">
                                        <div className="h-12 w-12 rounded-md overflow-hidden bg-muted shrink-0">
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                width={48}
                                                height={48}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">{item.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {item.quantity}x · {item.type === "DIGITAL" ? "Digital" : "Físico"}
                                            </p>
                                        </div>
                                        <PriceDisplay price={item.price * item.quantity} size="sm" />
                                    </div>
                                ))}
                            </div>

                            <Separator />

                            {/* Total */}
                            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                                <span className="font-medium">Total</span>
                                <PriceDisplay price={selectedOrder.total} size="lg" />
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </>
    )
}
