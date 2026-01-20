"use client";

import React from "react";
import { StatusBadge } from "@alvarosky/ui";
import styles from "@/styles/admin.module.css";

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
        <div className={styles.userGrid}>
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
        <div className={styles.userCard}>
            {/* Header: Name and Role */}
            <div className={styles.userHeader}>
                <div>
                    <div className={styles.userName}>
                        {user.name || "Sin nombre"}
                    </div>
                    <div className={styles.userEmail}>
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
            <div className={styles.userInfoGrid}>
                <div>
                    <div className={styles.infoLabel}>Suscripción</div>
                    <StatusBadge
                        label={subscriptionStatus}
                        variant={isActiveSubscription ? "success" : "default"}
                    />
                </div>
                <div>
                    <div className={styles.infoLabel}>Verificado</div>
                    <span className={user.emailVerified ? styles.verifiedYes : styles.verifiedNo}>
                        {user.emailVerified ? "✓ Sí" : "No"}
                    </span>
                </div>
                <div className={styles.responsiveDate}>
                    <div className={styles.infoLabel}>Registrado el</div>
                    <div className={styles.infoValue}>
                        {new Date(user.createdAt).toLocaleDateString("es-CO", {
                            year: 'numeric', month: 'long', day: 'numeric'
                        })}
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className={styles.actionsStack}>
                {!isActiveSubscription ? (
                    <button
                        onClick={() => onManageSubscription(user.id, "assign")}
                        disabled={isLoading}
                        className={`${styles.actionBtnFull} ${styles.btnAssign}`}
                    >
                        {isLoading ? "Procesando..." : "Asignar Suscripción Premium"}
                    </button>
                ) : (
                    <button
                        onClick={() => onManageSubscription(user.id, "cancel")}
                        disabled={isLoading}
                        className={`${styles.actionBtnFull} ${styles.btnCancel}`}
                    >
                        {isLoading ? "Procesando..." : "Cancelar Suscripción"}
                    </button>
                )}

                <button
                    onClick={() => onDelete(user.id)}
                    disabled={isLoading}
                    className={`${styles.actionBtnFull} ${styles.btnDelete}`}
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
            className={`${styles.roleSelect} ${isAdmin ? styles.roleAdmin : styles.roleUser}`}
        >
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
        </select>
    );
}

