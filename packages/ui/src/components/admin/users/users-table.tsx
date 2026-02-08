"use client";

import React from "react";
import { StatusBadge } from "../../../status-badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../../table";
import { Button } from "../../../button";
import { Badge } from "../../../badge";

// ============================================================================
// Types
// ============================================================================

export interface UserTableItem {
    id: string;
    email: string;
    name: string;
    role: "USER" | "ADMIN";
    emailVerified: boolean;
    createdAt: string | Date;
    subscription?: {
        status: string;
    };
}

export interface UsersTableProps {
    users: UserTableItem[];
    actionLoading: string | null;
    onRoleChange: (userId: string, newRole: "USER" | "ADMIN") => void;
    onDelete: (userId: string) => void;
    onManageSubscription: (userId: string, action: "assign" | "cancel") => void;
}

// ============================================================================
// Main Component
// ============================================================================

export function UsersTable({
    users,
    actionLoading,
    onRoleChange,
    onDelete,
    onManageSubscription,
}: UsersTableProps) {
    return (
        <div className="rounded-lg border bg-card overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent">
                        <TableHead>Usuario</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Rol</TableHead>
                        <TableHead>Verificado</TableHead>
                        <TableHead>Suscripción</TableHead>
                        <TableHead>Registro</TableHead>
                        <TableHead>Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                No se encontraron usuarios.
                            </TableCell>
                        </TableRow>
                    ) : (
                        users.map((user) => (
                            <UserRow
                                key={user.id}
                                user={user}
                                isLoading={actionLoading === user.id}
                                onRoleChange={onRoleChange}
                                onDelete={onDelete}
                                onManageSubscription={onManageSubscription}
                            />
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

interface UserRowProps {
    user: UserTableItem;
    isLoading: boolean;
    onRoleChange: (userId: string, newRole: "USER" | "ADMIN") => void;
    onDelete: (userId: string) => void;
    onManageSubscription: (userId: string, action: "assign" | "cancel") => void;
}

function UserRow({ user, isLoading, onRoleChange, onDelete, onManageSubscription }: UserRowProps) {
    const subscriptionStatus = user.subscription?.status || "Sin suscripción";
    const isActiveSubscription = subscriptionStatus === "ACTIVE";

    return (
        <TableRow className="transition-colors">
            {/* Usuario */}
            <TableCell className="font-medium">
                {user.name || "Sin nombre"}
            </TableCell>

            {/* Email */}
            <TableCell className="text-muted-foreground">
                {user.email}
            </TableCell>

            {/* Rol */}
            <TableCell>
                <RoleSelector
                    role={user.role}
                    disabled={isLoading}
                    onChange={(newRole) => onRoleChange(user.id, newRole)}
                />
            </TableCell>

            {/* Verificado */}
            <TableCell>
                {user.emailVerified ? (
                    <Badge variant="default" className="bg-green-500/20 text-green-500">✓ Sí</Badge>
                ) : (
                    <Badge variant="outline">No</Badge>
                )}
            </TableCell>

            {/* Suscripción */}
            <TableCell>
                <StatusBadge
                    label={subscriptionStatus}
                    variant={isActiveSubscription ? "success" : "default"}
                />
            </TableCell>

            {/* Fecha registro */}
            <TableCell className="text-muted-foreground text-sm">
                {new Date(user.createdAt).toLocaleDateString("es-CO")}
            </TableCell>

            {/* Acciones */}
            <TableCell>
                <div className="flex items-center gap-2">
                    {!isActiveSubscription ? (
                        <Button
                            onClick={() => onManageSubscription(user.id, "assign")}
                            disabled={isLoading}
                            size="sm"
                            variant="outline"
                            className="text-green-600 border-green-600 hover:bg-green-600 hover:text-white"
                        >
                            {isLoading ? "..." : "Suscribir"}
                        </Button>
                    ) : (
                        <Button
                            onClick={() => onManageSubscription(user.id, "cancel")}
                            disabled={isLoading}
                            size="sm"
                            variant="outline"
                            className="text-amber-600 border-amber-600 hover:bg-amber-600 hover:text-white"
                        >
                            {isLoading ? "..." : "Cancelar"}
                        </Button>
                    )}

                    <Button
                        onClick={() => onDelete(user.id)}
                        disabled={isLoading}
                        size="sm"
                        variant="destructive"
                    >
                        {isLoading ? "..." : "Eliminar"}
                    </Button>
                </div>
            </TableCell>
        </TableRow>
    );
}

// ============================================================================
// Role Selector
// ============================================================================

interface RoleSelectorProps {
    role: "USER" | "ADMIN";
    disabled: boolean;
    onChange: (newRole: "USER" | "ADMIN") => void;
}

function RoleSelector({ role, disabled, onChange }: RoleSelectorProps) {
    const isAdmin = role === "ADMIN";

    return (
        <select
            value={role}
            onChange={(e) => onChange(e.target.value as "USER" | "ADMIN")}
            disabled={disabled}
            className={`
                px-2 py-1 rounded text-xs font-medium border transition-colors
                ${isAdmin
                    ? "bg-purple-500/20 text-purple-500 border-purple-500/30"
                    : "bg-blue-500/20 text-blue-500 border-blue-500/30"
                }
                disabled:opacity-50 disabled:cursor-not-allowed
            `}
        >
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
        </select>
    );
}

export default UsersTable;
