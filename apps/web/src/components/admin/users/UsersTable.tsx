"use client";

import React from "react";
import { StatusBadge } from "@mauromera/ui";
import styles from "@/styles/admin.module.css";

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
        <div className={styles.tableContainer}>
            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th className={styles.th}>Usuario</th>
                            <th className={styles.th}>Email</th>
                            <th className={styles.th}>Rol</th>
                            <th className={styles.th}>Verificado</th>
                            <th className={styles.th}>Suscripción</th>
                            <th className={styles.th}>Registro</th>
                            <th className={styles.th}>Acciones</th>
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
        <tr className={styles.tr}>
            {/* Usuario */}
            <td className={styles.td}>
                <span style={{ fontWeight: 500, color: "var(--foreground)" }}>
                    {user.name || "Sin nombre"}
                </span>
            </td>

            {/* Email */}
            <td className={styles.td}>
                <span style={{ color: "var(--foreground-muted)" }}>
                    {user.email}
                </span>
            </td>

            {/* Rol */}
            <td className={styles.td}>
                <RoleSelector
                    role={user.role}
                    disabled={isLoading}
                    onChange={(newRole) => onRoleChange(user.id, newRole)}
                />
            </td>

            {/* Verificado */}
            <td className={styles.td}>
                <span className={user.emailVerified ? styles.verifiedYes : styles.verifiedNo}>
                    {user.emailVerified ? "✓ Sí" : "No"}
                </span>
            </td>

            {/* Suscripción */}
            <td className={styles.td}>
                <StatusBadge
                    label={subscriptionStatus}
                    variant={isActiveSubscription ? "success" : "default"}
                />
            </td>

            {/* Fecha registro */}
            <td className={styles.td}>
                <span style={{ color: "var(--foreground-muted)", fontSize: "0.85rem" }}>
                    {new Date(user.createdAt).toLocaleDateString("es-CO")}
                </span>
            </td>

            {/* Acciones */}
            <td className={styles.td}>
                <div className={styles.actionsColumn}>
                    {!isActiveSubscription ? (
                        <button
                            onClick={() => onManageSubscription(user.id, "assign")}
                            disabled={isLoading}
                            className={`${styles.actionBtnFull} ${styles.btnAssign}`}
                            style={{ width: "auto" }}
                            title="Asignar Suscripción"
                        >
                            {isLoading ? "..." : "Suscribir"}
                        </button>
                    ) : (
                        <button
                            onClick={() => onManageSubscription(user.id, "cancel")}
                            disabled={isLoading}
                            className={`${styles.actionBtnFull} ${styles.btnCancel}`}
                            style={{ width: "auto" }}
                            title="Cancelar Suscripción"
                        >
                            {isLoading ? "..." : "Cancelar"}
                        </button>
                    )}

                    <button
                        onClick={() => onDelete(user.id)}
                        disabled={isLoading}
                        className={`${styles.actionBtnFull} ${styles.btnDelete}`}
                        style={{ width: "auto" }}
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
            className={`${styles.roleSelect} ${isAdmin ? styles.roleAdmin : styles.roleUser}`}
        >
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
        </select>
    );
}
