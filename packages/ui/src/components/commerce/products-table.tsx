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
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "../../pagination"
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../select"
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
    isAvailable: boolean
    createdAt: Date
}

export interface ProductsTableProps {
    data: ProductTableData[]
    onEdit?: (product: ProductTableData) => void
    onDelete?: (productId: string) => void
    onView?: (product: ProductTableData) => void
    onToggleAvailable?: (productId: string, isAvailable: boolean) => void
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
import { Switch } from "../../switch"

function getColumns(
    onEdit?: (product: ProductTableData) => void,
    onDelete?: (productId: string) => void,
    onView?: (product: ProductTableData) => void,
    onToggleAvailable?: (productId: string, isAvailable: boolean) => void
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
            accessorKey: "isAvailable",
            header: "Disponible",
            cell: ({ row }) => (
                <Switch
                    checked={row.original.isAvailable}
                    onCheckedChange={(checked) => {
                        if (onToggleAvailable) {
                            onToggleAvailable(row.original.id, checked)
                        }
                    }}
                    aria-label="Toggle availability"
                />
            ),
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
                                <Link href={
                                    product.type === "RESTAURANT"
                                        ? `/restaurante/menu/${product.id}`
                                        : `/tienda/productos/${product.id}`
                                }>
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
export function ProductsTable({ data, onEdit, onDelete, onView, onToggleAvailable }: ProductsTableProps) {
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [globalFilter, setGlobalFilter] = useState("")

    const columns = getColumns(onEdit, onDelete, onView, onToggleAvailable)

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
            {/* Toolbar: Search & Filters */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                    <div className="relative w-full sm:flex-1 sm:max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Buscar productos..."
                            value={globalFilter}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            className="pl-9 w-full"
                        />
                    </div>
                </div>

                {/* Count */}
                <div className="text-sm text-muted-foreground">
                    {table.getFilteredRowModel().rows.length} producto(s)
                </div>
            </div>

            {/* Table */}
            <div className="w-full overflow-hidden rounded-md border bg-card/40">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header, index) => (
                                    <TableHead key={header.id} className={cn(
                                        "h-11 whitespace-nowrap",
                                        index === 0 && "pl-4",
                                        index === headerGroup.headers.length - 1 && "pr-4"
                                    )}>
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
                                >
                                    {row.getVisibleCells().map((cell, index) => (
                                        <TableCell key={cell.id} className={cn(
                                            "py-3",
                                            index === 0 && "pl-4",
                                            index === row.getVisibleCells().length - 1 && "pr-4"
                                        )}>
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

            {/* Pagination Controls */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 text-sm text-muted-foreground mt-4">
                <div className="text-center lg:text-left w-full lg:w-auto px-1">
                    Mostrando productos de la página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
                </div>

                <Pagination className="justify-end w-auto mx-0">
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious 
                                className="cursor-pointer"
                                onClick={() => table.previousPage()}
                                aria-disabled={!table.getCanPreviousPage()}
                            />
                        </PaginationItem>
                        
                        <PaginationItem>
                            <PaginationNext 
                                className="cursor-pointer"
                                onClick={() => table.nextPage()}
                                aria-disabled={!table.getCanNextPage()}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        </div>
    )
}
