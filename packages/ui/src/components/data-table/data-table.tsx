"use client"

import * as React from "react"
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    RowSelectionState,
    TableOptions,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../table"
import { Input } from "../../input"
import { DataTablePagination } from "./data-table-pagination"

// ============================================================================
// TYPES
// ============================================================================

interface DataTableProps<TData, TValue> {
    /** Column definitions */
    columns: ColumnDef<TData, TValue>[]
    /** Data array */
    data: TData[]
    /** Show pagination controls */
    showPagination?: boolean
    /** Initial page size */
    pageSize?: number
    /** Enable row selection */
    enableRowSelection?: boolean
    /** Callback when row selection changes */
    onRowSelectionChange?: (selectedRows: TData[]) => void
    /** Show loading skeleton */
    isLoading?: boolean
    /** Custom empty state message */
    emptyMessage?: string
    /** Additional toolbar content (rendered above table) */
    toolbar?: React.ReactNode
    /** Additional table options for advanced customization */
    tableOptions?: Partial<TableOptions<TData>>
    /** @deprecated Use toolbar with custom Input instead. Column key to filter by (backward compat) */
    searchKey?: string
}

// ============================================================================
// COMPONENT
// ============================================================================

export function DataTable<TData, TValue>({
    columns,
    data,
    showPagination = true,
    pageSize = 10,
    enableRowSelection = false,
    onRowSelectionChange,
    isLoading = false,
    emptyMessage = "No hay resultados.",
    toolbar,
    tableOptions,
    searchKey,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        enableRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
        initialState: {
            pagination: {
                pageSize,
            },
        },
        ...tableOptions,
    })

    // Notify parent of selection changes
    React.useEffect(() => {
        if (onRowSelectionChange) {
            const selectedRows = table
                .getFilteredSelectedRowModel()
                .rows.map((row) => row.original)
            onRowSelectionChange(selectedRows)
        }
    }, [rowSelection, onRowSelectionChange, table])

    return (
        <div className="space-y-4">
            {/* Backward compat: searchKey filter */}
            {searchKey && (
                <div className="flex items-center py-4 px-1">
                    <Input
                        placeholder="Filtrar..."
                        value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
                        onChange={(event) =>
                            table.getColumn(searchKey)?.setFilterValue(event.target.value)
                        }
                        className="max-w-sm"
                    />
                </div>
            )}

            {/* Toolbar */}
            {toolbar && <div className="flex items-center justify-between">{toolbar}</div>}

            {/* Table */}
            <div className="rounded-lg border bg-card overflow-hidden">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="bg-muted/30 hover:bg-muted/30">
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        className="text-xs font-medium text-muted-foreground"
                                    >
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
                        {isLoading ? (
                            // Loading skeleton
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    {columns.map((_, j) => (
                                        <TableCell key={j}>
                                            <div className="h-4 bg-muted animate-pulse rounded" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className="group"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
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
                                    {emptyMessage}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {showPagination && <DataTablePagination table={table} />}
        </div>
    )
}

// Re-export table instance type for external use
export type { Table as DataTableInstance } from "@tanstack/react-table"
