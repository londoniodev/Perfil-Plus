"use client";

import React from "react";
import StatusBadge from "@/app/components/ui/StatusBadge";
import { User } from "./UsersTable"; // Importing User type from existing table definition or re-define if preferred, let's re-define to be self-contained or import. 
// Actually, it's better to export User from a shared place or just re-define here to avoid dependency if we delete UsersTable later.
// But for now, let's re-define strictly what we need.

export interface UserGridItem {
    id: string;
    email: string;
    name: string;
    role: "USER" | "ADMIN";
    emailVerified: boolean;
    createdAt: string;
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
}

export default function UsersGrid({
    users,
    actionLoading,
    onRoleChange,
    onDelete,
    onManageSubscription,
}: UsersGridProps) {
    return (
        <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1.5rem",
        }}>
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
        <div style={{
            background: "var(--card-bg)",
            border: "1px solid var(--border)",
            borderRadius: "1rem",
            padding: "1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            transition: "all 0.2s",
        }}>
            {/* Header: Name and Role */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
                <div>
                    <div style={{ fontWeight: 600, color: "var(--foreground)", fontSize: "1.1rem" }}>
                        {user.name || "Sin nombre"}
                    </div>
                    <div style={{ color: "var(--foreground-muted)", fontSize: "0.9rem", wordBreak: "break-all" }}>
                        {user.email}
                    </div>
                </div>
                <RoleSelector
                    role={user.role}
                    disabled={isLoading}
                    onChange={(newRole) => onRoleChange(user.id, newRole)}
                />
            </div>

            {/* Info Grid */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
                padding: "1rem 0",
                borderTop: "1px solid var(--border)",
                borderBottom: "1px solid var(--border)",
            }}>
                <div>
                    <div style={labelStyle}>Suscripción</div>
                    <StatusBadge
                        label={subscriptionStatus}
                        variant={isActiveSubscription ? "success" : "default"}
                    />
                </div>
                <div>
                    <div style={labelStyle}>Verificado</div>
                    <span style={{
                        color: user.emailVerified ? "var(--success)" : "var(--foreground-muted)",
                        fontSize: "0.85rem",
                        fontWeight: 500,
                    }}>
                        {user.emailVerified ? "✓ Sí" : "No"}
                    </span>
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                    <div style={labelStyle}>Registrado el</div>
                    <div style={{ color: "var(--foreground)", fontSize: "0.9rem" }}>
                        {new Date(user.createdAt).toLocaleDateString("es-CO", {
                            year: 'numeric', month: 'long', day: 'numeric'
                        })}
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "0.75rem", flexDirection: "column" }}>
                {!isActiveSubscription ? (
                    <button
                        onClick={() => onManageSubscription(user.id, "assign")}
                        disabled={isLoading}
                        style={{
                            ...actionButtonStyle,
                            background: "rgba(34, 197, 94, 0.1)",
                            color: "#22c55e",
                            width: "100%",
                        }}
                    >
                        {isLoading ? "Procesando..." : "Asignar Suscripción Premium"}
                    </button>
                ) : (
                    <button
                        onClick={() => onManageSubscription(user.id, "cancel")}
                        disabled={isLoading}
                        style={{
                            ...actionButtonStyle,
                            background: "rgba(234, 179, 8, 0.1)",
                            color: "#eab308",
                            width: "100%",
                        }}
                    >
                        {isLoading ? "Procesando..." : "Cancelar Suscripción"}
                    </button>
                )}

                <button
                    onClick={() => onDelete(user.id)}
                    disabled={isLoading}
                    style={{
                        ...actionButtonStyle,
                        background: "rgba(239, 68, 68, 0.1)",
                        color: "#ef4444",
                        width: "100%",
                    }}
                >
                    {isLoading ? "Procesando..." : "Eliminar Usuario"}
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
            style={{
                background: isAdmin ? "rgba(232, 168, 56, 0.15)" : "rgba(91, 141, 239, 0.1)",
                color: isAdmin ? "var(--accent)" : "var(--primary-light)",
                border: "none",
                padding: "0.35rem 0.75rem",
                borderRadius: "999px",
                fontSize: "0.75rem",
                fontWeight: 700,
                cursor: disabled ? "wait" : "pointer",
                outline: "none",
            }}
        >
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
        </select>
    );
}

const labelStyle: React.CSSProperties = {
    fontSize: "0.75rem",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "var(--foreground-muted)",
    marginBottom: "0.25rem",
};

const actionButtonStyle: React.CSSProperties = {
    border: "none",
    padding: "0.75rem",
    borderRadius: "0.5rem",
    fontSize: "0.9rem",
    cursor: "pointer",
    fontWeight: 600,
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
};
