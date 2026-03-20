"use client";

import { ColumnDef, DataTableColumnHeader, Checkbox, Badge, Avatar, AvatarFallback, AvatarImage, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, Button } from "@alvarosky/ui";
import { MoreHorizontal, UserCog, Crown, Trash2 } from "lucide-react";

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

// ============================================================================
// HELPERS
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

// ============================================================================
// ACTION HANDLERS TYPE
// ============================================================================

export interface UserTableActions {
    onRoleChange?: (userId: string, newRole: "USER" | "ADMIN") => void;
    onDelete?: (userId: string) => void;
    onSubscriptionChange?: (userId: string, action: "assign" | "cancel") => void;
    actionLoading?: string | null;
}

// ============================================================================
// COLUMNS FACTORY
// ============================================================================

export function createUserColumns(actions?: UserTableActions): ColumnDef<User>[] {
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
        // User Column (Avatar + Name + Email)
        {
            accessorKey: "name",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Usuario" />
            ),
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
                        <div className="flex flex-col min-w-0">
                            <span className="font-medium text-foreground truncate">
                                {user.name || "Sin nombre"}
                            </span>
                            <span className="text-xs text-muted-foreground truncate">
                                {user.email}
                            </span>
                        </div>
                    </div>
                );
            },
        },
        // Email Column (hidden, used for filtering)
        {
            accessorKey: "email",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Email" />
            ),
            cell: ({ row }) => (
                <span className="text-muted-foreground">{row.original.email}</span>
            ),
            enableHiding: true,
        },
        // Role Column
        {
            accessorKey: "role",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Rol" />
            ),
            cell: ({ row }) => {
                const user = row.original;
                return (
                    <Badge
                        variant={user.role === "ADMIN" ? "default" : "secondary"}
                        className={user.role === "ADMIN" ? "bg-primary hover:bg-primary/90" : ""}
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
            id: "subscription",
            accessorFn: (row) => row.subscription?.status,
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Suscripción" />
            ),
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
        },
        // Date Column
        {
            accessorKey: "createdAt",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Registro" />
            ),
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
                const isLoading = actions?.actionLoading === user.id;
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
                                    actions?.onRoleChange?.(user.id, newRole);
                                }}
                                className="cursor-pointer"
                            >
                                <UserCog className="mr-2 h-4 w-4" />
                                Cambiar a {user.role === "ADMIN" ? "Usuario" : "Admin"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => actions?.onSubscriptionChange?.(user.id, isActive ? "cancel" : "assign")}
                                className="cursor-pointer"
                            >
                                <Crown className="mr-2 h-4 w-4" />
                                {isActive ? "Cancelar Premium" : "Asignar Premium"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => actions?.onDelete?.(user.id)}
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
