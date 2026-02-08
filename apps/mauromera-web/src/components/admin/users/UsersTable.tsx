"use client";

import React from "react";
import { UsersTable as SharedUsersTable, type UserTableItem } from "@alvarosky/ui";

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
// COMPONENTE WRAPPER
// ============================================================================

export default function UsersTable({
    users,
    actionLoading,
    onRoleChange,
    onDelete,
    onManageSubscription,
}: UsersTableProps) {
    // Map local User type to shared UserTableItem
    const mappedUsers: UserTableItem[] = users.map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        subscription: user.subscription
    }));

    return (
        <SharedUsersTable
            users={mappedUsers}
            actionLoading={actionLoading}
            onRoleChange={onRoleChange}
            onDelete={onDelete}
            onManageSubscription={onManageSubscription}
        />
    );
}

