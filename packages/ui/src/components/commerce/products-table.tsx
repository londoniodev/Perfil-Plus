"use client"

import { useState } from "react"
import Link from "next/link"
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
} from "../../table"
import { Badge } from "../../badge"
import { Button } from "../../button"
import { Input } from "../../input"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../../dropdown-menu"
import { PriceDisplay } from "../../price-display"
import { MoreHorizontal, ArrowUpDown, Pencil, Trash2, Eye, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "../../lib/utils"

// ============================================
// Types
// ============================================
export interface ProductTableData {
    id: string
    name: string
    image: string
    type: "PHYSICAL" | "DIGITAL" | "SERVICE" | string
    price: number
    stock: number | string
    published: boolean
    createdAt: Date
}

export interface ProductsTableProps {
    data: ProductTableData[]
    onEdit?: (product: ProductTableData) => void
    onDelete?: (productId: string) => void
    onView?: (product: ProductTableData) => void
}

// ============================================
// Badge Variants for Product Type
// ============================================
const productTypeBadge: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
    PHYSICAL: { label: "Físico", variant: "secondary" },
    DIGITAL: { label: "Digital", variant: "default" },
    SERVICE: { label: "Servicio", variant: "outline" },
}

// ============================================
// Column Definitions
// ============================================
function getColumns(
    onEdit?: (product: ProductTableData) => void,
    onDelete?: (productId: string) => void,
    onView?: (product: ProductTableData) => void
): ColumnDef<ProductTableData>[] {
    return [
        {
            accessorKey: "image",
            header: "Imagen",
            cell: ({ row }) => (
                <div className="h-12 w-12 overflow-hidden rounded-md border bg-muted">
                    <Image
                        src={row.original.image}
                        alt={row.original.name}
                        width={48}
                        height={48}
                        className="h-full w-full object-cover"
                    />
                </div>
            ),
            enableSorting: false,
        },
        {
            accessorKey: "name",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="-ml-4 h-8 data-[state=open]:bg-accent"
                >
                    Nombre
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="font-medium max-w-[200px] truncate">
                    {row.original.name}
                </div>
            ),
        },
        {
            accessorKey: "type",
            header: "Tipo",
            cell: ({ row }) => {
                const type = row.original.type
                const config = productTypeBadge[type] || productTypeBadge.PHYSICAL
                return <Badge variant={config.variant}>{config.label}</Badge>
            },
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id))
            },
        },
        {
            accessorKey: "price",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="-ml-4 h-8"
                >
                    Precio
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <PriceDisplay price={row.original.price} size="sm" />,
        },
        {
            accessorKey: "stock",
            header: "Stock",
            cell: ({ row }) => {
                const stock = row.original.stock
                if (stock === "Ilimitado" || stock === -1) {
                    return <span className="text-muted-foreground text-sm">∞</span>
                }
                return (
                    <span className={cn(
                        "text-sm font-medium",
                        typeof stock === "number" && stock <= 5 && "text-destructive"
                    )}>
                        {stock}
                    </span>
                )
            },
        },
        {
            accessorKey: "published",
            header: "Estado",
            cell: ({ row }) => (
                <Badge variant={row.original.published ? "default" : "outline"}>
                    {row.original.published ? "Activo" : "Borrador"}
                </Badge>
            ),
        },
        {
            id: "actions",
            header: () => <span className="sr-only">Acciones</span>,
            cell: ({ row }) => {
                const product = row.original

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="h-8 w-8 p-0 data-[state=open]:bg-muted"
                            >
                                <span className="sr-only">Abrir menú</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px]">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {onView && (
                                <DropdownMenuItem onClick={() => onView(product)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Ver detalles
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem asChild>
                                <Link href={`/admin/products/${product.id}`}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Editar
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {onDelete && (
                                <DropdownMenuItem
                                    onClick={() => onDelete(product.id)}
                                    className="text-destructive focus:text-destructive"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Eliminar
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]
}

// ============================================
// ProductsTable Component
// ============================================
export function ProductsTable({ data, onEdit, onDelete, onView }: ProductsTableProps) {
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [globalFilter, setGlobalFilter] = useState("")

    const columns = getColumns(onEdit, onDelete, onView)

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
            pagination: {
                pageSize: 10,
            },
        },
    })

    return (
        <div className="space-y-4">
            {/* Toolbar: Search Filter */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Buscar productos..."
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <div className="text-sm text-muted-foreground">
                    {table.getFilteredRowModel().rows.length} producto(s)
                </div>
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
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className="transition-colors"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="py-3">
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    No se encontraron productos.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                    Página {table.getState().pagination.pageIndex + 1} de{" "}
                    {table.getPageCount()}
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="h-8 w-8 p-0"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="sr-only">Anterior</span>
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="h-8 w-8 p-0"
                    >
                        <ChevronRight className="h-4 w-4" />
                        <span className="sr-only">Siguiente</span>
                    </Button>
                </div>
            </div>
        </div>
    )
}
