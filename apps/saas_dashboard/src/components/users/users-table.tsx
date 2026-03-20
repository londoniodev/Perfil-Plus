"use client";

import * as React from "react";
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
} from "@tanstack/react-table";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Button,
    Badge,
    Input,
    Checkbox,
    Avatar,
    AvatarFallback,
    AvatarImage,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Tabs,
    TabsList,
    TabsTrigger,
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@alvarosky/ui";
import {
    Search,
    MoreHorizontal,
    GripVertical,
    Trash2,
    UserCog,
    Crown,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPES
// ============================================================================

export interface User {
    id: string;
    email: string;
    name: string;
    role: "USER" | "ADMIN";
    emailVerified: boolean;
    createdAt: string;
    avatar?: string;
    subscription?: {
        status: string;
    };
}

interface UsersTableProps {
    data: User[];
    onRoleChange?: (userId: string, newRole: "USER" | "ADMIN") => void;
    onDelete?: (userId: string) => void;
    onSubscriptionChange?: (userId: string, action: "assign" | "cancel") => void;
    actionLoading?: string | null;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getInitials(name: string | undefined): string {
    if (!name) return "?";
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);
}

function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

// ============================================================================
// COLUMNS DEFINITION
// ============================================================================

function createColumns(
    onRoleChange?: UsersTableProps["onRoleChange"],
    onDelete?: UsersTableProps["onDelete"],
    onSubscriptionChange?: UsersTableProps["onSubscriptionChange"],
    actionLoading?: string | null
): ColumnDef<User>[] {
    return [
        // Selection Column
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Seleccionar todo"
                    className="translate-y-[2px]"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Seleccionar fila"
                    className="translate-y-[2px]"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        // Drag Handle (Visual Only)
        {
            id: "drag",
            header: () => null,
            cell: () => (
                <div className="cursor-grab text-muted-foreground/50 hover:text-muted-foreground">
                    <GripVertical className="h-4 w-4" />
                </div>
            ),
            enableSorting: false,
            enableHiding: false,
        },
        // User Column (Avatar + Name + Email)
        {
            accessorKey: "name",
            header: "Usuario",
            cell: ({ row }) => {
                const user = row.original;
                return (
                    <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                                {getInitials(user.name)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="font-medium text-foreground">
                                {user.name || "Sin nombre"}
                            </span>
                            <span className="text-xs text-muted-foreground">{user.email}</span>
                        </div>
                    </div>
                );
            },
        },
        // Email Column (hidden on mobile, for filtering)
        {
            accessorKey: "email",
            header: "Email",
            cell: ({ row }) => (
                <span className="text-muted-foreground">{row.original.email}</span>
            ),
            enableHiding: true,
        },
        // Role Column
        {
            accessorKey: "role",
            header: "Rol",
            cell: ({ row }) => {
                const user = row.original;
                return (
                    <Badge
                        variant={user.role === "ADMIN" ? "default" : "secondary"}
                        className={user.role === "ADMIN" ? "bg-indigo-500 hover:bg-indigo-600" : ""}
                    >
                        {user.role === "ADMIN" ? "Admin" : "Usuario"}
                    </Badge>
                );
            },
            filterFn: (row, id, value) => {
                return value === "ALL" || row.getValue(id) === value;
            },
        },
        // Subscription Column
        {
            accessorKey: "subscription",
            header: "Suscripción",
            cell: ({ row }) => {
                const user = row.original;
                const isActive = user.subscription?.status === "ACTIVE";
                return (
                    <Badge
                        variant={isActive ? "default" : "outline"}
                        className={isActive ? "bg-emerald-500 hover:bg-emerald-600" : "text-muted-foreground"}
                    >
                        {isActive ? "Premium" : "Gratis"}
                    </Badge>
                );
            },
            filterFn: (row, id, value) => {
                if (value === "ALL") return true;
                const isActive = row.original.subscription?.status === "ACTIVE";
                return value === "active" ? isActive : !isActive;
            },
        },
        // Date Column
        {
            accessorKey: "createdAt",
            header: "Registro",
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                    {new Date(row.original.createdAt).toLocaleDateString("es-CO", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                    })}
                </span>
            ),
        },
        // Actions Column
        {
            id: "actions",
            header: () => null,
            cell: ({ row }) => {
                const user = row.original;
                const isLoading = actionLoading === user.id;
                const isActive = user.subscription?.status === "ACTIVE";

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                disabled={isLoading}
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            >
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Abrir menú</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => {
                                    const newRole = user.role === "ADMIN" ? "USER" : "ADMIN";
                                    onRoleChange?.(user.id, newRole);
                                }}
                                className="cursor-pointer"
                            >
                                <UserCog className="mr-2 h-4 w-4" />
                                Cambiar a {user.role === "ADMIN" ? "Usuario" : "Admin"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => onSubscriptionChange?.(user.id, isActive ? "cancel" : "assign")}
                                className="cursor-pointer"
                            >
                                <Crown className="mr-2 h-4 w-4" />
                                {isActive ? "Cancelar Premium" : "Asignar Premium"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => onDelete?.(user.id)}
                                className="cursor-pointer text-destructive focus:text-destructive"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar Usuario
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function UsersTable({
    data,
    onRoleChange,
    onDelete,
    onSubscriptionChange,
    actionLoading,
}: UsersTableProps) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({
        email: false, // Hide email column by default (shown in user cell)
    });
    const [rowSelection, setRowSelection] = React.useState({});
    const [globalFilter, setGlobalFilter] = React.useState("");
    const [activeTab, setActiveTab] = React.useState("all");

    const columns = React.useMemo(
        () => createColumns(onRoleChange, onDelete, onSubscriptionChange, actionLoading),
        [onRoleChange, onDelete, onSubscriptionChange, actionLoading]
    );

    // Filter data based on active tab
    const filteredData = React.useMemo(() => {
        switch (activeTab) {
            case "admins":
                return data.filter((u) => u.role === "ADMIN");
            case "premium":
                return data.filter((u) => u.subscription?.status === "ACTIVE");
            case "free":
                return data.filter((u) => u.subscription?.status !== "ACTIVE");
            default:
                return data;
        }
    }, [data, activeTab]);

    const table = useReactTable({
        data: filteredData,
        columns,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            globalFilter,
        },
        enableRowSelection: true,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        globalFilterFn: "includesString",
    });

    return (
        <div className="space-y-4">
            {/* Header: Tabs + Search */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full lg:w-auto">
                    <TabsList className="bg-muted/50 w-full justify-start overflow-x-auto flex h-auto p-1 scrollbar-hide">
                        <TabsTrigger value="all" className="text-xs sm:text-sm whitespace-nowrap">
                            Todos
                            <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                                {data.length}
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger value="admins" className="text-xs sm:text-sm">
                            Admins
                        </TabsTrigger>
                        <TabsTrigger value="premium" className="text-xs sm:text-sm">
                            Premium
                        </TabsTrigger>
                        <TabsTrigger value="free" className="text-xs sm:text-sm">
                            Gratis
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="relative w-full lg:w-72 shrink-0">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nombre o email..."
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        className="pl-8"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="w-full overflow-hidden rounded-md border bg-card/40">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className={cn(
                                        "text-xs font-medium text-muted-foreground whitespace-nowrap",
                                        header.id === headerGroup.headers[0].id && "pl-4"
                                    )}>
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
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className="group"
                                >
                                    {row.getVisibleCells().map((cell, index) => (
                                        <TableCell key={cell.id} className={cn(index === 0 && "pl-4")}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No se encontraron resultados.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Footer: Selection Info + Pagination */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 text-sm text-muted-foreground mt-4">
                <div className="text-center lg:text-left w-full lg:w-auto">
                    {table.getFilteredSelectedRowModel().rows.length} de{" "}
                    {table.getFilteredRowModel().rows.length} fila(s) seleccionada(s).
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span className="text-xs">Filas por página</span>
                        <Select
                            value={table.getState().pagination.pageSize.toString()}
                            onValueChange={(value) => table.setPageSize(Number(value))}
                        >
                            <SelectTrigger className="h-8 w-[70px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {[10, 20, 30, 50].map((size) => (
                                    <SelectItem key={size} value={size.toString()}>
                                        {size}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious 
                                    className="cursor-pointer"
                                    onClick={() => table.previousPage()}
                                    aria-disabled={!table.getCanPreviousPage()}
                                />
                            </PaginationItem>
                            
                            {/* Logic for simple pagination numbers could go here, but for now we follow the user's manual style or just next/prev */}
                            <PaginationItem>
                                <span className="text-xs font-medium px-2">
                                    Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
                                </span>
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
        </div>
    );
}
