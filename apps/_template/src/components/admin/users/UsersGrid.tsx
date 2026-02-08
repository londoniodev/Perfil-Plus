"use client";

import React from "react";
import { UsersGrid as SharedUsersGrid, type UserGridItem } from "@alvarosky/ui";

// ============================================================================
// TYPES
// ============================================================================

export interface UserGridItemLocal {
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
    users: UserGridItemLocal[];
    actionLoading: string | null;
    onRoleChange: (userId: string, newRole: "USER" | "ADMIN") => void;
    onDelete: (userId: string) => void;
    onManageSubscription: (userId: string, action: "assign" | "cancel") => void;
}

// ============================================================================
// COMPONENTE WRAPPER
// ============================================================================

export default function UsersGrid({
    users,
    actionLoading,
    onRoleChange,
    onDelete,
    onManageSubscription,
}: UsersGridProps) {
    // Map types
    const mappedUsers: UserGridItem[] = users.map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        subscription: user.subscription
    }));

    return (
        <SharedUsersGrid
            users={mappedUsers}
            actionLoading={actionLoading}
            onRoleChange={onRoleChange}
            onDelete={onDelete}
            onManageSubscription={onManageSubscription}
        />
    );
}

