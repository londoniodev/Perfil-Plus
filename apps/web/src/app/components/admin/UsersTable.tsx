"use client";

import React from "react";
import StatusBadge from "@/app/components/ui/StatusBadge";

// ============================================================================
// TIPOS
// ============================================================================

export interface User {
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

interface UsersTableProps {
    users: User[];
    actionLoading: string | null;
    onRoleChange: (userId: string, newRole: "USER" | "ADMIN") => void;
    onDelete: (userId: string) => void;
    onManageSubscription: (userId: string, action: "assign" | "cancel") => void;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function UsersTable({
    users,
    actionLoading,
    onRoleChange,
    onDelete,
    onManageSubscription,
}: UsersTableProps) {
    return (
        <div style={{
            background: "var(--card-bg)",
            border: "1px solid var(--border)",
            borderRadius: "1rem",
            overflow: "hidden",
        }}>
            <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
                    <thead>
                        <tr style={{
                            background: "rgba(255,255,255,0.02)",
                            borderBottom: "1px solid var(--border)",
                        }}>
                            <th style={thStyle}>Usuario</th>
                            <th style={thStyle}>Email</th>
                            <th style={thStyle}>Rol</th>
                            <th style={thStyle}>Verificado</th>
                            <th style={thStyle}>Suscripción</th>
                            <th style={thStyle}>Registro</th>
                            <th style={thStyle}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <UserRow
                                key={user.id}
                                user={user}
                                isLoading={actionLoading === user.id}
                                onRoleChange={onRoleChange}
                                onDelete={onDelete}
                                onManageSubscription={onManageSubscription}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ============================================================================
// FILA DE USUARIO
// ============================================================================

interface UserRowProps {
    user: User;
    isLoading: boolean;
    onRoleChange: (userId: string, newRole: "USER" | "ADMIN") => void;
    onDelete: (userId: string) => void;
    onManageSubscription: (userId: string, action: "assign" | "cancel") => void;
}

function UserRow({ user, isLoading, onRoleChange, onDelete, onManageSubscription }: UserRowProps) {
    const subscriptionStatus = user.subscription?.status || "Sin suscripción";
    const isActiveSubscription = subscriptionStatus === "ACTIVE";

    return (
        <tr style={{ borderBottom: "1px solid var(--border)" }}>
            {/* Usuario */}
            <td style={tdStyle}>
                <span style={{ fontWeight: 500, color: "var(--foreground)" }}>
                    {user.name || "Sin nombre"}
                </span>
            </td>

            {/* Email */}
            <td style={tdStyle}>
                <span style={{ color: "var(--foreground-muted)" }}>
                    {user.email}
                </span>
            </td>

            {/* Rol */}
            <td style={tdStyle}>
                <RoleSelector
                    role={user.role}
                    disabled={isLoading}
                    onChange={(newRole) => onRoleChange(user.id, newRole)}
                />
            </td>

            {/* Verificado */}
            <td style={tdStyle}>
                <span style={{
                    color: user.emailVerified ? "var(--success)" : "var(--foreground-muted)",
                    fontSize: "0.85rem",
                }}>
                    {user.emailVerified ? "✓ Sí" : "No"}
                </span>
            </td>

            {/* Suscripción */}
            <td style={tdStyle}>
                <StatusBadge
                    label={subscriptionStatus}
                    variant={isActiveSubscription ? "success" : "default"}
                />
            </td>

            {/* Fecha registro */}
            <td style={tdStyle}>
                <span style={{ color: "var(--foreground-muted)", fontSize: "0.85rem" }}>
                    {new Date(user.createdAt).toLocaleDateString("es-CO")}
                </span>
            </td>

            {/* Acciones */}
            <td style={tdStyle}>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                    {!isActiveSubscription ? (
                        <button
                            onClick={() => onManageSubscription(user.id, "assign")}
                            disabled={isLoading}
                            style={{
                                ...actionButtonStyle,
                                background: "rgba(34, 197, 94, 0.1)",
                                color: "#22c55e",
                            }}
                            title="Asignar Suscripción"
                        >
                            {isLoading ? "..." : "Suscribir"}
                        </button>
                    ) : (
                        <button
                            onClick={() => onManageSubscription(user.id, "cancel")}
                            disabled={isLoading}
                            style={{
                                ...actionButtonStyle,
                                background: "rgba(234, 179, 8, 0.1)",
                                color: "#eab308",
                            }}
                            title="Cancelar Suscripción"
                        >
                            {isLoading ? "..." : "Cancelar"}
                        </button>
                    )}

                    <button
                        onClick={() => onDelete(user.id)}
                        disabled={isLoading}
                        style={{
                            ...actionButtonStyle,
                            background: "rgba(239, 68, 68, 0.1)",
                            color: "#ef4444",
                        }}
                        title="Eliminar Usuario"
                    >
                        {isLoading ? "..." : "Eliminar"}
                    </button>
                </div>
            </td>
        </tr>
    );
}

// ============================================================================
// SELECTOR DE ROL
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
            style={{
                background: isAdmin ? "rgba(232, 168, 56, 0.15)" : "rgba(91, 141, 239, 0.1)",
                color: isAdmin ? "var(--accent)" : "var(--primary-light)",
                border: "none",
                padding: "0.35rem 0.75rem",
                borderRadius: "999px",
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: disabled ? "wait" : "pointer",
            }}
        >
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
        </select>
    );
}

// ============================================================================
// ESTILOS
// ============================================================================

const thStyle: React.CSSProperties = {
    padding: "1rem",
    textAlign: "left",
    fontWeight: 600,
    color: "var(--foreground-muted)",
    fontSize: "0.8rem",
    textTransform: "uppercase",
    letterSpacing: "0.05rem",
};

const tdStyle: React.CSSProperties = {
    padding: "1rem",
    verticalAlign: "middle",
};

const actionButtonStyle: React.CSSProperties = {
    border: "none",
    padding: "0.35rem 0.75rem",
    borderRadius: "0.5rem",
    fontSize: "0.8rem",
    cursor: "pointer",
    fontWeight: 500,
    transition: "all 0.2s",
};
