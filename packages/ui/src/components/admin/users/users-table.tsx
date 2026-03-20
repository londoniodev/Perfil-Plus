"use client";

import React, { useState } from "react";
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
import { PremiumDaysDialog } from "./premium-days-dialog";

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
    onManageSubscription: (userId: string, action: "assign" | "cancel", days?: number) => void;
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
    const [premiumDialog, setPremiumDialog] = useState<{ open: boolean; userId: string; userName: string }>({
        open: false,
        userId: "",
        userName: "",
    });

    const handleAssignClick = (userId: string, userName: string) => {
        setPremiumDialog({ open: true, userId, userName });
    };

    const handleConfirmPremium = (days: number) => {
        onManageSubscription(premiumDialog.userId, "assign", days);
        setPremiumDialog({ open: false, userId: "", userName: "" });
    };

    return (
        <>
            <div className="rounded-lg border border-border/40 bg-card overflow-hidden">
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
                                    onAssignPremium={handleAssignClick}
                                />
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <PremiumDaysDialog
                open={premiumDialog.open}
                onOpenChange={(open) => setPremiumDialog((prev) => ({ ...prev, open }))}
                userName={premiumDialog.userName}
                onConfirm={handleConfirmPremium}
                loading={!!actionLoading}
            />
        </>
    );
}

interface UserRowProps {
    user: UserTableItem;
    isLoading: boolean;
    onRoleChange: (userId: string, newRole: "USER" | "ADMIN") => void;
    onDelete: (userId: string) => void;
    onManageSubscription: (userId: string, action: "assign" | "cancel", days?: number) => void;
    onAssignPremium: (userId: string, userName: string) => void;
}

function UserRow({ user, isLoading, onRoleChange, onDelete, onManageSubscription, onAssignPremium }: UserRowProps) {
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
                    <Badge variant="default" className="bg-success/20 text-success">✓ Sí</Badge>
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
                            onClick={() => onAssignPremium(user.id, user.name || user.email)}
                            disabled={isLoading}
                            size="sm"
                            variant="outline"
                            className="text-success border-success/50 hover:bg-success hover:text-success-foreground"
                        >
                            {isLoading ? "..." : "Suscribir"}
                        </Button>
                    ) : (
                        <Button
                            onClick={() => onManageSubscription(user.id, "cancel")}
                            disabled={isLoading}
                            size="sm"
                            variant="outline"
                            className="text-warning border-warning/50 hover:bg-warning hover:text-warning-foreground"
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
                    ? "bg-primary/20 text-primary border-primary/20"
                    : "bg-info/20 text-info border-info/20"
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
