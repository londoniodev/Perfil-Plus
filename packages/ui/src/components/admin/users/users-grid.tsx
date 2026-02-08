"use client";

import React from "react";
import { StatusBadge } from "../../../status-badge";
import { cn } from "../../../lib/utils";

// ============================================================================
// TYPES
// ============================================================================

export interface UserGridItem {
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

interface UsersGridProps {
    users: UserGridItem[];
    actionLoading: string | null;
    onRoleChange: (userId: string, newRole: "USER" | "ADMIN") => void;
    onDelete: (userId: string) => void;
    onManageSubscription: (userId: string, action: "assign" | "cancel") => void;
    className?: string;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function UsersGrid({
    users,
    actionLoading,
    onRoleChange,
    onDelete,
    onManageSubscription,
    className
}: UsersGridProps) {
    return (
        <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", className)}>
            {users.map((user) => (
                <UserCard
                    key={user.id}
                    user={user}
                    isLoading={actionLoading === user.id}
                    onRoleChange={onRoleChange}
                    onDelete={onDelete}
                    onManageSubscription={onManageSubscription}
                />
            ))}
        </div>
    );
}

// ============================================================================
// TARJETA DE USUARIO
// ============================================================================

interface UserCardProps {
    user: UserGridItem;
    isLoading: boolean;
    onRoleChange: (userId: string, newRole: "USER" | "ADMIN") => void;
    onDelete: (userId: string) => void;
    onManageSubscription: (userId: string, action: "assign" | "cancel") => void;
}

function UserCard({ user, isLoading, onRoleChange, onDelete, onManageSubscription }: UserCardProps) {

    const subscriptionStatus = user.subscription?.status || "Sin suscripción";
    const isActiveSubscription = subscriptionStatus === "ACTIVE";

    return (
        <div className="flex flex-col gap-4 rounded-lg border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
            {/* Header: Name and Role */}
            <div className="flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col min-w-0">
                        <div className="font-semibold text-lg leading-tight truncate text-foreground">
                            {user.name || "Sin nombre"}
                        </div>
                        <div className="text-sm text-muted-foreground truncate">
                            {user.email}
                        </div>
                    </div>
                </div>
                <div className="flex justify-end pt-1">
                    <RoleSelector
                        role={user.role}
                        disabled={isLoading}
                        onChange={(newRole) => onRoleChange(user.id, newRole)}
                    />
                </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4 border-t border-b py-4">
                <div className="flex flex-col gap-1">
                    <div className="text-xs font-medium uppercase text-muted-foreground">Suscripción</div>
                    <div className="flex">
                        <StatusBadge
                            label={subscriptionStatus}
                            variant={isActiveSubscription ? "success" : "default"}
                        />
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    <div className="text-xs font-medium uppercase text-muted-foreground">Verificado</div>
                    <div>
                        <span className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border",
                            user.emailVerified
                                ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800"
                                : "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
                        )}>
                            {user.emailVerified ? "✓ Sí" : "No"}
                        </span>
                    </div>
                </div>
                <div className="col-span-2 flex flex-col gap-1">
                    <div className="text-xs font-medium uppercase text-muted-foreground">Registrado el</div>
                    <div className="text-sm font-medium">
                        {new Date(user.createdAt).toLocaleDateString("es-CO", {
                            year: 'numeric', month: 'long', day: 'numeric'
                        })}
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 mt-auto">
                {!isActiveSubscription ? (
                    <button
                        onClick={() => onManageSubscription(user.id, "assign")}
                        disabled={isLoading}
                        className={cn(
                            "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                            "bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full",
                            "bg-green-600 hover:bg-green-700 text-white"
                        )}
                    >
                        {isLoading ? "Procesando..." : "Asignar Suscripción Premium"}
                    </button>
                ) : (
                    <button
                        onClick={() => onManageSubscription(user.id, "cancel")}
                        disabled={isLoading}
                        className={cn(
                            "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                            "border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full",
                            "text-amber-600 border-amber-200 hover:bg-amber-50 dark:border-amber-900 dark:hover:bg-amber-950"
                        )}
                    >
                        {isLoading ? "Procesando..." : "Cancelar Suscripción"}
                    </button>
                )}

                <button
                    onClick={() => onDelete(user.id)}
                    disabled={isLoading}
                    className={cn(
                        "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                        "hover:bg-destructive/10 text-muted-foreground hover:text-destructive h-9 px-3 w-full"
                    )}
                >
                    {isLoading ? "..." : "Eliminar Usuario"}
                </button>
            </div>
        </div>
    );
}

// Subcomponents & Styles

function RoleSelector({ role, disabled, onChange }: { role: "USER" | "ADMIN", disabled: boolean, onChange: (r: "USER" | "ADMIN") => void }) {
    const isAdmin = role === "ADMIN";
    return (
        <select
            value={role}
            onChange={(e) => onChange(e.target.value as "USER" | "ADMIN")}
            disabled={disabled}
            className={cn(
                "h-7 rounded px-2 text-xs font-semibold uppercase tracking-wide border bg-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50",
                isAdmin
                    ? "border-purple-200 text-purple-700 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800"
                    : "border-blue-200 text-blue-700 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
            )}
        >
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
        </select>
    );
}
